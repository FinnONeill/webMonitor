// Dependancies
const express = require('express');
const request = require('request-promise');
const pino = require('pino');
require('dotenv').config()

// Assets
const config = require('./config/config.json');

const app = express();
const port = process.env.PORT || '3000';
const logger = pino({
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
});

// Get's current public IP of the server
// https://www.ipify.org/
async function getPublicIP() {
    return new Promise(async (resolve, reject) => {
        await request.get(`https://api.ipify.org/?format=json`)
        .then(res => {
            return JSON.parse(res);
        })
        .then(body => {
            logger.info(body);
            resolve(body);
        })
        .catch(error => {
            logger.error(error);
            // TODO :: Send Email Notification of API Failure
            reject(error);
        });
    });
}

// Fetch DNS Records from Cloudflare
// https://developers.cloudflare.com/api/operations/dns-records-for-a-zone-list-dns-records
async function getDNSRecords(website) {
    return new Promise(async (resolve, reject) => {
        await request.get({
            headers: {
                "Content-Type": "application/json",
            },
            auth: {
                bearer: `${process.env.CLOUDFLARE_TOKEN}`
            },
            url: `https://api.cloudflare.com/client/v4/zones/${website.zone}/dns_records?`
        })
        .then(res => {
            return JSON.parse(res);
        })
        .then(body => {
            logger.info(body);
            resolve(body);
        })
        .catch(error => {
            logger.error(error);
            // TODO :: Send Email Notification of API Failure
            reject(error);
        });
    });
}

// Fetch DNS Records from Cloudflare
// https://developers.cloudflare.com/api/operations/dns-records-for-a-zone-update-dns-record
async function updateDNSRecords(website, record) {
    return new Promise(async (resolve, reject) => {
        await request.put({
            headers: {
                "Content-Type": "application/json",
            },
            auth: {
                bearer: `${process.env.CLOUDFLARE_TOKEN}`
            },
            url: `https://api.cloudflare.com/client/v4/zones/${website.zone}/dns_records/${record.id}`,
            body: record
        })
        .then(res => {
            return JSON.parse(res);
        })
        .then(body => {
            logger.info(body);
            resolve(body);
        })
        .catch(error => {
            logger.error(error);
            // TODO :: Send Email Notification of API Failure
            reject(error);
        });
    });
}

app.get('/', async (req, res) => {
    const incorrectDNS = [];
    const publicIP = await getPublicIP(); // Get's public IP of server

    // Check DNS Records of each website from config
    for (let index = 0; index < config.websites.length; index++) {
        const element = config.websites[index];
        const dnsRecords = await getDNSRecords(element);
        
        if(dnsRecords.errors.length === 0) {
            // Check IP Matches DNS Records, if not send email
            const aRecords = dnsRecords.result.filter(val => val.type === 'A');
            aRecords.forEach(element => {
                if(publicIP.ip !== element.content) {
                    incorrectDNS.push({
                        website: website,
                        record: element
                    });
                }
            });
        }
    }

    if(incorrectDNS.length > 0) {
        // Update DNS Record
        for (let index = 0; index < incorrectDNS.length; index++) {
            incorrectDNS[index].record.content = publicIP.ip;
            logger.info(`Started to update incorrectDNS[${index}]`, incorrectDNS[index]);
            updateDNSRecords(incorrectDNS[index].website, incorrectDNS[index].record);
            logger.info(`Finished update on incorrectDNS[${index}]`, incorrectDNS[index]);
        }
    }

    return res.send({
        message: incorrectDNS.length > 0 ? 'ERROR' : 'OK',
        IP: publicIP.ip,
        records: incorrectDNS
    });
});

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});