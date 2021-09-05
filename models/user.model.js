const { ObjectID } = require('bson');
const mongoose = require('mongoose');
let Schema = mongoose.Schema;

// const Review = new Schema({
//     listingAdd: {
//         type: String,
//         required: true,
//         unique: false
//     },
//     listingId: {
//         type: ObjectID,
//         required: true,
//         unique: false
//     },
//     stars: {
//         type: Number,
//         required :true,
//         unique: false
//     },
//     comments: {
//         type: String,
//         required: false.valueOf,
//         unique: false
//     },
//     title: {
//         type: String,
//         required: false,
//         unique: false
//     }
// });

const User = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    firstname : {
        type: String,
    },
    lastname : {
        type:String
    }, 
    password: {
        type:String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    reviews: [{reviewId: {type: ObjectID}}],
    upvotes: [{reviewId: {type: ObjectID}}]
});
module.exports = mongoose.model('User', User);