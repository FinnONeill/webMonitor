// Dependancies
const express = require('express');
const cron = require('node-cron');
require('dotenv').config();

// Components
const logger = require('./components/pino/pino');

// Controllers
const { monitorDNS } = require('./controllers/monitorDNS');

// Routes
const homeRoutes = require('./routes/home.route');

const app = express();
const port = process.env.PORT || '3000';

// Routes
app.use(`/api`, homeRoutes);

// Run DNS Monitor x1 times a day
if(process.env.ENABLE_CRON_MONITOR.toUpperCase() === 'TRUE') {
    cron.schedule('0 0 * * *', () => {
        monitorDNS();
    });
}

app.listen(port, () => {
    console.info(`Server is running on port ${port}`);
    logger.info(`Server is running on port ${port}`);
});