const request = require('request-promise');

// Components
const logger = require('../pino/pino');

// Assets
const config = require('../../config/config.json');

// Sendgrid API Ref
// https://docs.sendgrid.com/api-reference/how-to-use-the-sendgrid-v3-api/authentication
async function sendEmail(type, to, subject, message) {
    return new Promise(async (resolve, reject) => {
        const from = {};

        switch (type.toUpperCase()) {
            case 'ADMIN':
                from.email = config.email.admin.address;
                from.name = config.email.admin.name;
                break;
            default:
                from.email = config.email.admin.address;
                from.name = config.email.admin.name;
                break;
        }

        const body = {
            personalizations:[
               {
                  to: to,
                  subject: subject
               }
            ],
            content:[
               {
                  type:"text/plain",
                  value: message
               }
            ],
            from: from
        };

        if(
            process.env.ENABLE_EMAIL.toUpperCase() === 'TRUE' &&
            process.env.NODE_ENV.toUpperCase() === 'PROD'
        ) {
            await request.post({
                headers: {
                    "Content-Type": "application/json",
                },
                auth: {
                    bearer: `${process.env.SENDGRID_API_KEY}`
                },
                url: `https://api.sendgrid.com/v3/mail/send`,
                body: body,
                json: true
            })
            .then(body => {
                logger.info({
                    process_name: 'sendEmail',
                    step: 'Returned response',
                    status: 'Success'
                });
                resolve({
                    ok: true
                });
            })
            .catch(error => {
                logger.error({
                    process_name: 'sendEmail',
                    step: 'Returned response',
                    status: 'Failed',
                    error: error
                });
                reject({
                    ok: false,
                    error: error
                });
            });
        } else {
            logger.info({
                process_name: 'sendEmail',
                step: 'Email Disabled',
                status: 'Success'
            });
            resolve({
                ok: true
            });
        }
    });
}

exports.sendEmail = sendEmail;