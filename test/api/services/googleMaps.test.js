//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

require('module-alias/register');
require('dotenv').config({path: '.env.test'});

//Require the dev-dependencies
const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const googleMaps = require('@google/maps');

const dummyClient = googleMaps.createClient({key: 'dummy_key'});
const clientStub = sinon.stub(googleMaps, 'createClient').returns(dummyClient);

// Must be done after the stub
const GoogleMapsService = require('@api/services/googleMaps');
const CacheService = require('@api/services/cache');

const LairResponse = require('@models/responses/lair.response');
const googleMapDummyResponse = require('./../../resources/googleMapGetPlace.response');
const googleMapPlacePhotoDummyResponse = require('./../../resources/googleMapGetPlacePhoto.response');

describe('Google maps service', () => {

    afterEach(function () {
        sinon.restore();
    });

    describe('Get lair', () => {
        it('should call google map api when cache is expired and set the cache', (done) => {
            const getCacheStub = sinon.stub(CacheService, 'getPlace').resolves(null);
            const setCacheStub = sinon.stub(CacheService, 'setPlace').resolves(null);
            const getPlaceStub = sinon.stub(dummyClient, 'place').returns({
                asPromise: () => new Promise((resolve, reject) => {
                    resolve(googleMapDummyResponse)
                })
            });
            const getPlacePhotoStub = sinon.stub(dummyClient, 'placesPhoto').returns({
                asPromise: () => new Promise((resolve, reject) => {
                    resolve(googleMapPlacePhotoDummyResponse)
                })
            });
            GoogleMapsService.getPlaceDetails('1').then(() => {
                expect(getCacheStub.calledOnce).to.be.true;
                expect(setCacheStub.calledOnce).to.be.true;
                expect(getPlaceStub.calledOnce).to.be.true;
                expect(getPlacePhotoStub.calledTwice).to.be.true;
                done();
            })
        });
        it('should return the cache value when cache is available', (done) => {
            const getCacheStub = sinon.stub(CacheService, 'getPlace').resolves({test: true});
            const setCacheStub = sinon.stub(CacheService, 'setPlace').rejects(new Error('Should not pop'));
            const getPlaceStub = sinon.stub(dummyClient, 'place').returns({
                asPromise: () => new Promise((resolve, reject) => {
                    resolve(googleMapDummyResponse)
                })
            });
            const getPlacePhotoStub = sinon.stub(dummyClient, 'placesPhoto').returns({
                asPromise: () => new Promise((resolve, reject) => {
                    resolve(googleMapPlacePhotoDummyResponse)
                })
            });
            GoogleMapsService.getPlaceDetails('1').then((result) => {
                expect(result.test).to.be.true;
                expect(getCacheStub.calledOnce).to.be.true;
                expect(setCacheStub.called).to.be.false;
                expect(getPlaceStub.called).to.be.false;
                expect(getPlacePhotoStub.called).to.be.false;
                done();
            })
        });
        it('should force the cache to be refreshed with options.forceRefresh', (done) => {
            const getCacheStub = sinon.stub(CacheService, 'getPlace').resolves({test: true});
            const setCacheStub = sinon.stub(CacheService, 'setPlace').resolves();
            const getPlaceStub = sinon.stub(dummyClient, 'place').returns({
                asPromise: () => new Promise((resolve, reject) => {
                    resolve(googleMapDummyResponse)
                })
            });
            const getPlacePhotoStub = sinon.stub(dummyClient, 'placesPhoto').returns({
                asPromise: () => new Promise((resolve, reject) => {
                    resolve(googleMapPlacePhotoDummyResponse)
                })
            });
            GoogleMapsService.getPlaceDetails('1', {forceRefresh: true}).then((result) => {
                expect(result.test).to.be.undefined;
                expect(result.name).to.be.equal('Le Chardenoux');
                expect(getCacheStub.calledOnce).to.be.false;
                expect(setCacheStub.called).to.be.true;
                expect(getPlaceStub.called).to.be.true;
                expect(getPlacePhotoStub.calledTwice).to.be.true;
                done();
            })
        });
        it('should parse the result to a LairResponse', (done) => {
            const getCacheStub = sinon.stub(CacheService, 'getPlace').resolves(null);
            const setCacheStub = sinon.stub(CacheService, 'setPlace').resolves();
            const getPlaceStub = sinon.stub(dummyClient, 'place').returns({
                asPromise: () => new Promise((resolve, reject) => {
                    resolve(googleMapDummyResponse)
                })
            });
            const getPlacePhotoStub = sinon.stub(dummyClient, 'placesPhoto').returns({
                asPromise: () => new Promise((resolve, reject) => {
                    resolve(googleMapPlacePhotoDummyResponse)
                })
            });
            GoogleMapsService.getPlaceDetails('1').then((result) => {
                expect(result.formatted_address).to.undefined;
                expect(result.address).to.be.equal('1 Rue Jules Vallès, 75011 Paris, France');
                expect(result.name).to.be.equal('Le Chardenoux');
                expect(getCacheStub.calledOnce).to.be.true;
                expect(setCacheStub.called).to.be.true;
                expect(getPlaceStub.called).to.be.true;
                expect(getPlacePhotoStub.calledTwice).to.be.true;
                done();
            })
        });
        it('should throw an error when GoogleMap throws an error', (done) => {
            const getCacheStub = sinon.stub(CacheService, 'getPlace').resolves(null);
            const setCacheStub = sinon.stub(CacheService, 'setPlace').resolves();
            const getPlaceStub = sinon.stub(dummyClient, 'place').returns({
                asPromise: () => new Promise((resolve, reject) => {
                    reject(new Error('My error'));
                })
            });
            const getPlacePhotoStub = sinon.stub(dummyClient, 'placesPhoto').returns({
                asPromise: () => new Promise((resolve, reject) => {
                    resolve(googleMapPlacePhotoDummyResponse)
                })
            });
            GoogleMapsService.getPlaceDetails('1').then((result) => {
                expect(false).to.be.true;
                done();
            }).catch((err) => {
                expect(err.message).to.be.equal('My error');
                expect(getCacheStub.calledOnce).to.be.true;
                expect(setCacheStub.called).to.be.false;
                expect(getPlaceStub.called).to.be.true;
                expect(getPlacePhotoStub.called).to.be.false;
                done();
            })
        });
        it('should not failed when get cache fails', (done) => {
            const getCacheStub = sinon.stub(CacheService, 'getPlace').rejects(new Error('My error'));
            const setCacheStub = sinon.stub(CacheService, 'setPlace').resolves();
            const getPlaceStub = sinon.stub(dummyClient, 'place').returns({
                asPromise: () => new Promise((resolve, reject) => {
                    resolve(googleMapDummyResponse)
                })
            });
            const getPlacePhotoStub = sinon.stub(dummyClient, 'placesPhoto').returns({
                asPromise: () => new Promise((resolve, reject) => {
                    resolve(googleMapPlacePhotoDummyResponse)
                })
            });
            GoogleMapsService.getPlaceDetails('1').then((result) => {
                expect(result.name).to.be.equal('Le Chardenoux');
                expect(getCacheStub.calledOnce).to.be.true;
                expect(setCacheStub.called).to.be.true;
                expect(getPlaceStub.called).to.be.true;
                expect(getPlacePhotoStub.calledTwice).to.be.true;
                done();
            })
        });
        it('should not failed when set cache fails', (done) => {
            const getCacheStub = sinon.stub(CacheService, 'getPlace').resolves(null);
            const setCacheStub = sinon.stub(CacheService, 'setPlace').rejects(new Error('Failed'));
            const getPlaceStub = sinon.stub(dummyClient, 'place').returns({
                asPromise: () => new Promise((resolve, reject) => {
                    resolve(googleMapDummyResponse)
                })
            });
            const getPlacePhotoStub = sinon.stub(dummyClient, 'placesPhoto').returns({
                asPromise: () => new Promise((resolve, reject) => {
                    resolve(googleMapPlacePhotoDummyResponse)
                })
            });
            GoogleMapsService.getPlaceDetails('1').then((result) => {
                expect(result.name).to.be.equal('Le Chardenoux');
                expect(getCacheStub.calledOnce).to.be.true;
                expect(setCacheStub.called).to.be.true;
                expect(getPlaceStub.called).to.be.true;
                expect(getPlacePhotoStub.calledTwice).to.be.true;
                done();
            })
        });
        it('should not failed when get picture fails', (done) => {
            const getCacheStub = sinon.stub(CacheService, 'getPlace').resolves(null);
            const setCacheStub = sinon.stub(CacheService, 'setPlace').rejects(new Error('Failed'));
            const getPlaceStub = sinon.stub(dummyClient, 'place').returns({
                asPromise: () => new Promise((resolve, reject) => {
                    resolve(googleMapDummyResponse)
                })
            });
            const getPlacePhotoStub = sinon.stub(dummyClient, 'placesPhoto').returns({
                asPromise: () => new Promise((resolve, reject) => {
                    reject(new Error('FAILED'))
                })
            });
            GoogleMapsService.getPlaceDetails('1').then((result) => {
                expect(result.name).to.be.equal('Le Chardenoux');
                expect(getCacheStub.calledOnce).to.be.true;
                expect(setCacheStub.called).to.be.true;
                expect(getPlaceStub.called).to.be.true;
                expect(getPlacePhotoStub.calledTwice).to.be.true;
                done();
            })
        });
    });
});
