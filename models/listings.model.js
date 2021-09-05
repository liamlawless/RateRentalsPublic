const { ObjectID } = require('bson');
const mongoose = require('mongoose');
let Schema = mongoose.Schema;
const Listing = new Schema({
    address: {
        type: String,
        //unique: true,
        required: true
    },
    city: {
        type:String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: false
    },
    rateSum: {
        type: Number
    },
    reviews: [{reviewId: {type: ObjectID}}],
    coords: {
        type:String
    },
    numReviews: {
        type: Number 
    }
});
Listing.index({address:1,city:1,state:1}, {unique:true});
module.exports = mongoose.model('Listing', Listing);