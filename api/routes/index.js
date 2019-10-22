const auth = require('./../utils/auth');

const validator = require('@api/utils/validator');
const lairsValidator = require('@models/validators/lairs.validator');

const IndexController = require('@api/controllers/index.ctrl');

module.exports = (router) => {
    router.post('/users', auth.required, validator(lairsValidator, 'body'), IndexController.postUser);
    router.get('/users', auth.required, IndexController.getUser);
};
