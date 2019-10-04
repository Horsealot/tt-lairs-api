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
let mongoose = require('mongoose');
const UserModel = mongoose.model('User');

const GoogleMapsClient = require('@api/services/googleMaps');
const LairResponse = require('@models/responses/lair.response');
const googleMapDummyResponse = require('./../../resources/googleMapGetPlace.response');

chai.use(chaiHttp);
//Our parent block
describe('Index route', () => {
    beforeEach((done) => {
        UserModel.deleteMany({}).then(() => {
            done();
        });
    });
    afterEach(function () {
        sinon.restore();
    });

    describe('POST /users', () => {
        it('should create the user', (done) => {
            sinon.stub(GoogleMapsClient, 'getPlaceDetails').resolves(new LairResponse(googleMapDummyResponse.json.result));
            chai.request(server)
                .post('/api/users')
                .set('Authorization', 'Bearer ' + jwt.sign({
                    id: '5d83431020e57635c3aeb52e',
                }, process.env.INTERNAL_SECRET_TOKEN))
                .send(['fakePlaceId'])
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    res.body[0].name.should.be.equal('Le Chardenoux');
                    UserModel.findOne({_userId: '5d83431020e57635c3aeb52e'}).then((user) => {
                        expect(user).to.be.not.null;
                        expect(user.lairs).to.be.length(1);
                        done();
                    });
                });
        });
        it('should update the user', (done) => {
            const user = new UserModel({
                _userId: '5d83431020e57635c3aeb52e'
            });
            user.save().then((user) => {
                const getPlaceDetailStub = sinon.stub(GoogleMapsClient, 'getPlaceDetails');
                getPlaceDetailStub.onCall(0).resolves(new LairResponse(googleMapDummyResponse.json.result));
                let secondResponse = new LairResponse(googleMapDummyResponse.json.result);
                secondResponse.name = 'Second place';
                getPlaceDetailStub.onCall(1).resolves(secondResponse);
                chai.request(server)
                    .post('/api/users')
                    .set('Authorization', 'Bearer ' + jwt.sign({
                        id: user._userId,
                    }, process.env.INTERNAL_SECRET_TOKEN))
                    .send(['fakePlaceId','secondFakePlaceId'])
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.an('array');
                        res.body[0].name.should.be.equal('Le Chardenoux');
                        res.body[1].name.should.be.equal('Second place');
                        UserModel.findOne({_userId: '5d83431020e57635c3aeb52e'}).then((user) => {
                            expect(user).to.be.not.null;
                            expect(user.lairs).to.be.length(2);
                            done();
                        });
                    });
            });
        });
        it('should not set the lair when its validation fails', (done) => {
            const getPlaceDetailStub = sinon.stub(GoogleMapsClient, 'getPlaceDetails');
            getPlaceDetailStub.onCall(0).resolves(new LairResponse(googleMapDummyResponse.json.result));
            getPlaceDetailStub.onCall(1).rejects(new Error('RandomError'));
            chai.request(server)
                .post('/api/users')
                .set('Authorization', 'Bearer ' + jwt.sign({
                    id: '5d83431020e57635c3aeb52e',
                }, process.env.INTERNAL_SECRET_TOKEN))
                .send(['fakePlaceId','secondFakePlaceId'])
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    res.body[0].name.should.be.equal('Le Chardenoux');
                    UserModel.findOne({_userId: '5d83431020e57635c3aeb52e'}).then((user) => {
                        expect(user).to.be.not.null;
                        expect(user.lairs).to.be.length(1);
                        done();
                    });
                });
        });
    });

    describe('GET /users', () => {
        it('should return an empty array for an unknown user', (done) => {
            chai.request(server)
                .get('/api/users')
                .set('Authorization', 'Bearer ' + jwt.sign({
                    id: '5d83431020e57635c3aeb52e',
                }, process.env.INTERNAL_SECRET_TOKEN))
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array').of.length(0);
                    UserModel.findOne({_userId: '5d83431020e57635c3aeb52e'}).then((user) => {
                        expect(user).to.be.null;
                        done();
                    });
                });
        });
        it('should return an array of the user lairs', (done) => {
            const user = new UserModel({
                _userId: '5d83431020e57635c3aeb52e',
                lairs: [
                    'lairs1',
                    'lairs2',
                ]
            });
            user.save().then((user) => {
                const getPlaceDetailStub = sinon.stub(GoogleMapsClient, 'getPlaceDetails');
                getPlaceDetailStub.onCall(0).resolves(new LairResponse(googleMapDummyResponse.json.result));
                let secondResponse = new LairResponse(googleMapDummyResponse.json.result);
                secondResponse.name = 'Second place';
                getPlaceDetailStub.onCall(1).resolves(secondResponse);
                chai.request(server)
                    .get('/api/users')
                    .set('Authorization', 'Bearer ' + jwt.sign({
                        id: user._userId,
                    }, process.env.INTERNAL_SECRET_TOKEN))
                    .send()
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.an('array').of.length(2);
                        res.body[0].name.should.be.equal('Le Chardenoux');
                        res.body[1].name.should.be.equal('Second place');
                        UserModel.findOne({_userId: '5d83431020e57635c3aeb52e'}).then((user) => {
                            expect(user).to.be.not.null;
                            expect(user.lairs).to.be.length(2);
                            done();
                        });
                    });
            });
        });
        it('should not set the lair when its validation fails', (done) => {
            const getPlaceDetailStub = sinon.stub(GoogleMapsClient, 'getPlaceDetails');
            getPlaceDetailStub.onCall(0).resolves(new LairResponse(googleMapDummyResponse.json.result));
            getPlaceDetailStub.onCall(1).rejects(new Error('RandomError'));
            chai.request(server)
                .post('/api/users')
                .set('Authorization', 'Bearer ' + jwt.sign({
                    id: '5d83431020e57635c3aeb52e',
                }, process.env.INTERNAL_SECRET_TOKEN))
                .send(['fakePlaceId','secondFakePlaceId'])
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    res.body[0].name.should.be.equal('Le Chardenoux');
                    UserModel.findOne({_userId: '5d83431020e57635c3aeb52e'}).then((user) => {
                        expect(user).to.be.not.null;
                        expect(user.lairs).to.be.length(1);
                        done();
                    });
                });
        });
    });

});
