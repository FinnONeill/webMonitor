const path = require('path');
const fs = require('fs');

// Components
const logger = require('../components/pino/pino');

async function removeOldLogs() {
    const retentionInDays = parseInt(process.env.RETENTION_IN_DAYS);
    const dirPath =  path.join(process.cwd(), process.env.LOG_DIRNAME);
    const dirFiles = fs.readdirSync(dirPath);
    let noDeletedFiles = 0;

    for (let index = 0; index < dirFiles.length; index++) {
        const element = dirFiles[index];
        const filePath = path.join(dirPath, element);
        const file = await fs.statSync(filePath);

        const fileAgeInDays = getDiffInDays(file.ctime);
        if(fileAgeInDays > retentionInDays) {
            logger.info(`Started to delete old log file (${element})`);
            fs.unlinkSync(filePath);
            logger.info(`Successfully deleted old log file (${element})`);
            noDeletedFiles++;
        }
    }

    logger.info({
        process_name: 'removeOldLogs',
        step: 'Summary',
        status: 'Success',
        noDeletedFiles: noDeletedFiles
    });
}

function getDiffInDays(fileCreationDate) {
    if(!(fileCreationDate instanceof Date)) {
        fileCreationDate = new Date(fileCreationDate);
    }

    const today = new Date();
    const diffInMs = today - fileCreationDate;
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return Math.round(diffInDays);
}

exports.removeOldLogs = removeOldLogs;