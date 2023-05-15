const request = require('request-promise');

// Components
const logger = require('../pino/pino');

// Fetch DNS Records from Cloudflare
// https://developers.cloudflare.com/api/operations/dns-records-for-a-zone-list-dns-records
async function getDNSRecords(website) {
    return new Promise(async (resolve, reject) => {
        if(process.env.ENABLE_CLOUDFLARE.toUpperCase() === 'TRUE') {
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
                logger.info({
                    process_name: 'getDNSRecords',
                    step: 'Returned response',
                    status: 'Success'
                }, body);
                resolve(body);
            })
            .catch(async error => {
                logger.error({
                    process_name: 'getDNSRecords',
                    step: 'Returned response',
                    status: 'Failed',
                    error: error
                });
                
                reject(error);
            });
        } else {
            logger.info({
                process_name: 'getDNSRecords',
                step: 'Cloudflare Disabled',
                status: 'Success'
            });
            resolve({});
        }
    });
}

exports.getDNSRecords = getDNSRecords;