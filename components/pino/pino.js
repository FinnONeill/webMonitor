const pino = require('pino');
const path = require('path');

const transports = pino.transport({
    targets: [
        {
            level: 'trace',
            target: 'pino/file',
            options: {
                destination: path.join(process.cwd(), `logs`, `${new Date().toISOString().split('T')[0].replaceAll('-', '_')}.log`),
                mkdir: true
            },
        },
        {
            level: 'trace',
            target: 'pino-pretty',
            options: {
                colorize: true
            },
        },
    ],
});
const pinoOptions = {};

module.exports = pino(pinoOptions, transports);