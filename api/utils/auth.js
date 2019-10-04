const jwt = require('express-jwt');

const secret = process.env.INTERNAL_SECRET_TOKEN;
if (!secret) throw new Error("Missing env variable INTERNAL_SECRET_TOKEN");

const getTokenFromHeaders = (req) => {
    const {headers: {authorization}} = req;

    if (authorization && authorization.split(' ')[0] === 'Bearer') {
        return authorization.split(' ')[1];
    }
    return null;
};


const auth = {
    required: jwt({
        secret: secret,
        userProperty: 'payload',
        getToken: getTokenFromHeaders,
    }),
};

module.exports = auth;
