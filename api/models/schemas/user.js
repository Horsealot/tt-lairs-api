const mongoose = require('mongoose');
const {Schema} = mongoose;

var UserSchema = new Schema({
    _userId: Schema.Types.ObjectId,
    created_at: {type: Date, default: Date.now},
    lairs: [String],
    last_updated_at: {type: Date, default: Date.now},
});

UserSchema.statics.upsertUser = async function (userId) {
    let user = await this.findOne({'_userId': userId});
    if (!user) {
        user = new this({_userId: userId});
    }
    return user;
};

UserSchema.pre('save', function (next) {
    this.last_updated_at = new Date();
    next();
});


module.exports = mongoose.model('User', UserSchema);
