const mongoose = require('mongoose');
const UserModel = mongoose.model('User');
const Logger = require('@logger');
const GoogleMapsClient = require('@api/services/googleMaps');

const self = {
    /**
     * Post user lairs. For each lairs we force the cache refresh
     * @param req
     * @param res
     * @returns {Promise<LairResponse>}
     */
    postUser: async (req, res) => {
        const userId = req.payload.id;
        // Remove duplicates
        const lairIds = [...new Set(req.body)];

        let user = await UserModel.upsertUser(userId);

        let validUserLairs = [];
        for(let i=0; i<lairIds.length; i++) {
            try {
                const formattedLair = await GoogleMapsClient.getPlaceDetails(lairIds[i], {forceRefresh: true});
                validUserLairs.push(formattedLair);
            } catch(e) {
                Logger.error(`index.ctrl.js\tLair {${lairIds[i]}} could not be added to {${userId}}, reason {${e.message}}`);
            }
        }
        user.lairs = validUserLairs.map((lair) => lair.publicId);
        await user.save();
        res.send(validUserLairs);
    },
    /**
     * Get user lairs from cache or Google maps
     * @param req
     * @param res
     * @returns {Promise<LairResponse>}
     */
    getUser: async (req, res) => {
        const userId = req.payload.id;
        let existingUser = await UserModel.findOne({_userId: userId});
        if(!existingUser) {
            return res.send([]);
        }
        let validUserLairs = [];
        for(let i=0; i<existingUser.lairs.length; i++) {
            try {
                const formattedLair = await GoogleMapsClient.getPlaceDetails(existingUser.lairs[i]);
                validUserLairs.push(formattedLair);
            } catch(e) {
                Logger.error(`index.ctrl.js\tLair {${lairIds[i]}} could not be retrieved for user {${userId}}, reason {${e.message}}`);
            }
        }
        res.send(validUserLairs);
    }
};

module.exports = self;
