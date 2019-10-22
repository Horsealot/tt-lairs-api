const Joi = require('@hapi/joi');

const schemas = Joi.array().items(
    Joi.string().alphanum()
).required();

module.exports = schemas;
