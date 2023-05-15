
// Components
const { updateDNSRecords } = require('../components/cloudflare/updateDNSRecords');
const { getDNSRecords } = require('../components/cloudflare/getDNSRecords');
const { getPublicIP } = require('../components/ipify/getPublicIP');
const { sendEmail } = require('../components/sendgrid/sendEmail');
const logger = require('../components/pino/pino');

// Assets
const config = require('../config/config.json');
const status = ['PENDING', 'No Action', 'PROCESSED'];

async function monitorDNS() {
    const incorrectDNS = [];
    const publicIP = await getPublicIP(); // Get's public IP of server

    // Check DNS Records of each website from config
    for (let index = 0; index < config.websites.length; index++) {
        const website = config.websites[index];
        const dnsRecords =  await getDNSRecords(website);
        
        if(dnsRecords?.errors?.length === 0) {
            // Check IP Matches DNS Records, if not send email
            const aRecords = dnsRecords.result.filter(val => val.type === 'A');
            aRecords.forEach(record => {
                record.status = status[0];
                if(publicIP.ip !== record.content) {
                    incorrectDNS.push({
                        website: website,
                        record: record
                    });
                } else {
                    record.status = status[1];
                }
            });
        }
    }

    // If there's records that don't match
    if(incorrectDNS.length > 0) {
        // Update DNS Record
        for (let index = 0; index < incorrectDNS.length; index++) {
            incorrectDNS[index].record.content = publicIP.ip;
            logger.info({
                process_name: 'updateDNSRecords',
                step: 'Call Not Started',
                status: 'Pending'
            }, incorrectDNS[index]);
            const updatedRecord = await updateDNSRecords(incorrectDNS[index].website, incorrectDNS[index].record)
            incorrectDNS[index].record.status = status[2];
        }

        // Send Email of summary
        sendEmail(
            'ADMIN', 
            [{
                email: process.env.NOTIFICATION_EMAIL,
                name: `Finn O'Neill`
            }],
            `WebMonitor - DNS Records Updated`,
            `Hi Admin,
            Your IP address was changed and we updated the following DNS Records:

            ${JSON.stringify(incorrectDNS)}

            Kind regards, 
            Admin.
            `
        );
    }

    return {
        message: 'OK',
        IP: publicIP.ip,
        records: incorrectDNS
    };
}

exports.monitorDNS = monitorDNS;