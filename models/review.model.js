const { ObjectID } = require('bson');
const mongoose = require('mongoose');
let Schema = mongoose.Schema;
const Review = new Schema({
    listingAdd: {
        type: String,
        required: true,
        unique: false
    },
    listingId: {
        type: ObjectID,
        required: true,
        unique: false
    },
    userId: {
        type: ObjectID,
        required: true,
    },
    stars: {
        type: Number,
        required :true,
    },
    comments: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: false,
    },
    upvotes: {
        type: Number
    },
    date: {
        type: String
    }
});
module.exports = mongoose.model('Review', Review)