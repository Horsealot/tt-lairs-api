//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

require('module-alias/register');
require('dotenv').config({path: '.env.test'});

let jwt = require('jsonwebtoken');
let chai = require('chai');
let expect = chai.expect;
let chaiHttp = require('chai-http');
let server = require('./../../../app');
let should = chai.should();
let sinon = require('sinon');

chai.use(chaiHttp);
//Our parent block
describe('Index route', () => {

    describe('POST /users', () => {
        it('should not accept an unauthenticated request', (done) => {
            chai.request(server)
                .post('/api/users')
                .send()
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
        it('should return 422 for invalid input', (done) => {
            chai.request(server)
                .post('/api/users')
                .set('Authorization', 'Bearer ' + jwt.sign({
                    id: '5d83431020e57635c3aeb52e',
                }, process.env.INTERNAL_SECRET_TOKEN))
                .send({})
                .end((err, res) => {
                    res.should.have.status(422);
                    done();
                });
        });
        it('should return 200 for valid input', (done) => {
            chai.request(server)
                .post('/api/users')
                .set('Authorization', 'Bearer ' + jwt.sign({
                    id: '5d83431020e57635c3aeb52e',
                }, process.env.INTERNAL_SECRET_TOKEN))
                .send([])
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });

    describe('GET /users', () => {
        it('should not accept an unauthenticated request', (done) => {
            chai.request(server)
                .get('/api/users')
                .send()
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
        it('should return 200 for an authenticated user', (done) => {
            chai.request(server)
                .get('/api/users')
                .set('Authorization', 'Bearer ' + jwt.sign({
                    id: '5d83431020e57635c3aeb52e',
                }, process.env.INTERNAL_SECRET_TOKEN))
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });

});
