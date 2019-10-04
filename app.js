require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const router = express.Router();

require('module-alias/register');

// Databases
require('./api/models');

const routes = require('./api/routes');
const logger = require('@logger');

// Constants
const PORT = process.env.PORT || '8080';

// App
const app = express();

//Configure our app
app.use(cors());
app.use(helmet());
if (process.env.NODE_ENV !== 'test') {
    app.use(require('morgan')('dev'));
}
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '5mb'}));

routes(router);
app.use('/api', router);

logger.info(`SERVER\tRunning on port ${PORT}`);
module.exports = app;
// module.exports = app.listen(PORT);
