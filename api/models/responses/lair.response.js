class LairResponse {
    constructor(googleAddress) {
        this.name = googleAddress.name;
        this.publicId = googleAddress.public_id;
        this.types = googleAddress.types;
        this.address = googleAddress.formatted_address;
        this.photos = googleAddress.photos;
        this.geometry = googleAddress.geometry;
    }
}

module.exports = LairResponse;
