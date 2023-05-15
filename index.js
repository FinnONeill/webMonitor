// Dependancies
const express = require('express');
const cron = require('node-cron');
require('dotenv').config();

// Components
const logger = require('./components/pino/pino');

// Controllers
const { monitorDNS } = require('./controllers/monitorDNS');
const { removeOldLogs } = require('./controllers/removeOldLogs');

// Routes
const homeRoutes = require('./routes/home.route');

const app = express();
const port = process.env.PORT || '3000';

// Routes
app.use(`/api`, homeRoutes);

// Run DNS Monitor x1 times a day at 00:00
if(process.env.ENABLE_CRON_MONITOR.toUpperCase() === 'TRUE') {
    cron.schedule('0 0 * * *', () => {
        monitorDNS();
    });
}

// Run Log Retention Job x1 times a day at 00:00
if(process.env.ENABLE_LOG_RETENTION.toUpperCase() === 'TRUE') {
    cron.schedule('0 1 * * *', () => {
        removeOldLogs();
    });
}

app.listen(port, () => {
    console.info(`Server is running on port ${port}`);
    logger.info(`Server is running on port ${port}`);
});