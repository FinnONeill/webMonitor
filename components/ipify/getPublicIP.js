const request = require('request-promise');

// Components
const logger = require('../pino/pino');
const { sendEmail } = require('../sendgrid/sendEmail');

// Get's current public IP of the server
// https://www.ipify.org/
async function getPublicIP() {
    return new Promise(async (resolve, reject) => {
        if(process.env.ENABLE_IP.toUpperCase() === 'TRUE') {
            await request.get(`https://api.ipify.org/?format=json`)
            .then(res => {
                return JSON.parse(res);
            })
            .then(body => {
                logger.info({
                    process_name: 'getPublicIP',
                    step: 'Returned response',
                    status: 'Success'
                }, body);
                resolve(body);
            })
            .catch(async error => {
                const log = {
                    process_name: 'getPublicIP',
                    step: 'Returned response',
                    status: 'Failed',
                    error: error
                };
                logger.error(log);
                
                sendEmail(
                    'ADMIN', 
                    [{
                        email: process.env.NOTIFICATION_EMAIL,
                        name: `Finn O'Neill`
                    }],
                    `WebMonitor - GetPublicIP Failed`,
                    `Hi Admin,
                    There was an issue with getPublicIP where it returned an error. See log below:

                    ${JSON.stringify(log)}

                    Kind regards, 
                    Admin.
                    `
                );

                reject(error);
            });
        } else {
            logger.info({
                process_name: 'getPublicIP',
                step: 'IP Disabled',
                status: 'Success'
            });
            resolve({
                ip: '192.168.0.1'
            });
        }
    });
}

exports.getPublicIP = getPublicIP;