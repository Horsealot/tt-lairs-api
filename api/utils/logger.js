'use strict';

const {createLogger, format, transports} = require('winston');

const {combine, timestamp, printf} = format;

const myFormat = printf(({level, message, label, timestamp}) => {
    return `${timestamp}\t${level}\t${message}`;
});

const level = process.env.NODE_ENV === 'test' ? 'none' : 'debug';

const logger = createLogger({
    level: level,
    format: combine(
        timestamp(),
        myFormat
    ),
    transports: [new transports.Console()]
});

module.exports = logger;

