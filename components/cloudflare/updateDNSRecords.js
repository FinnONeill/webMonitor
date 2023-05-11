const request = require('request-promise');

// Components
const logger = require('../pino/pino');

// Fetch DNS Records from Cloudflare
// https://developers.cloudflare.com/api/operations/dns-records-for-a-zone-update-dns-record
async function updateDNSRecords(website, record) {
    return new Promise(async (resolve, reject) => {
        if(
            process.env.ENABLE_CLOUDFLARE.toUpperCase() === 'TRUE' &&
            process.env.NODE_ENV.toUpperCase() === 'PROD'
        ) {
            await request.put({
                headers: {
                    "Content-Type": "application/json",
                },
                auth: {
                    bearer: `${process.env.CLOUDFLARE_TOKEN}`
                },
                url: `https://api.cloudflare.com/client/v4/zones/${website.zone}/dns_records/${record.id}`,
                body: record,
                json: true
            })
            .then(body => {
                logger.info({
                    process_name: 'updateDNSRecords',
                    step: 'Returned response',
                    status: 'Success'
                }, body);
                resolve(body);
            })
            .catch(error => {
                logger.error({
                    process_name: 'updateDNSRecords',
                    step: 'Returned response',
                    status: 'Failed'
                }, error);
                // TODO :: Send Email Notification of API Failure
                reject(error);
            });
        } else {
            logger.info({
                process_name: 'updateDNSRecords',
                step: 'Cloudflare Disabled',
                status: 'Success'
            });
            resolve({});
        }
    });
}

exports.updateDNSRecords = updateDNSRecords;