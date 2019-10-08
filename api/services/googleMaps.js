const Logger = require('@api/utils/logger');

const LairResponse = require('@models/responses/lair.response');

const googleApiKey = process.env.GOOGLE_API_KEY;
if (!googleApiKey) throw new Error("Missing env variable GOOGLE_API_KEY");

const googleMapsClient = require('@google/maps').createClient({
    key: googleApiKey,
    Promise: Promise
});

const CacheService = require('./cache');

const getPhotoUrl = (response) => {
    return "https://" + response.req.socket._host + response.req.path;
};

const self = {
    /**
     * Get place details from cache or GoogleMaps API if we have no corresponding data in cache
     * If options.forceRefresh is true, cache is not used
     * @param placeid
     * @param options
     * @returns {Promise<object>}
     * @throws Error
     */
    getPlaceDetails: async (placeid, options) => {
        let cachedPlace = null;
        try {
            cachedPlace = (!options || !options.forceRefresh) ? await CacheService.getPlace(placeid) : null;
        } catch (err) {
            Logger.error(`googleMaps.js\tError while getting place {${placeid}} cache {${err.message}}`);
        }

        if (cachedPlace) {
            Logger.debug(`googleMaps.js\tCached version of {${placeid}} retrieved`);
            return cachedPlace;
        }

        let response;
        try {
            response = await googleMapsClient.place({
                placeid, fields: [
                    'place_id',
                    'name',
                    'type',
                    'photo',
                    'geometry/location',
                    'formatted_address'
                ]
            }).asPromise();
        } catch (err) {
            Logger.error(`googleMaps.js\tError while getting place {${placeid}} details {${err.message}}`);
            throw err;
        }
        const mappedPlace = new LairResponse(response.json.result);
        let placePhotos = [];
        await Promise.all(mappedPlace.photos.map((photo) => {
            return new Promise((resolve) => {
                self.getPlacePhoto().then((gmapPhoto) => {
                    photo.url = getPhotoUrl(gmapPhoto);
                    placePhotos.push(photo);
                    resolve();
                }).catch((err) => {
                    Logger.error(`googleMaps.js\tError while getting place {${placeid}} photo {${photo.photo_reference}} {${err.message}}`);
                    resolve();
                });
            })
        }));
        try {
            await CacheService.setPlace(placeid, mappedPlace);
            Logger.debug(`googleMaps.js\t{${placeid}} cached`);
        } catch (err) {
            Logger.error(`googleMaps.js\tError while caching place {${placeid}}details {${err.message}}`);
        }
        return mappedPlace;
    },
    getPlacePhoto: (photoreference) => {
        return googleMapsClient.placesPhoto({
            photoreference,
            maxheight: 800,
            maxwidth: 800,
        }).asPromise();
    },
};

module.exports = self;
