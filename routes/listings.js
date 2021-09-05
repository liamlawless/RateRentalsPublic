const express = require("express");
let router = express.Router();
module.exports = router;
const url = require('url');
// Mongoose
let mongoose = require('mongoose');
const { EDESTADDRREQ, EWOULDBLOCK } = require("constants");
const Listing = mongoose.model('Listing');
const User = mongoose.model('User');
const Review = mongoose.model('Review');
const request = require('request-promise');
const e = require("express");
const { Console } = require("console");
const MAX_SEARCH_RESULTS = 20;

const toTitleCase = (phrase) => {
    return phrase
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

var streets = {
    'Rd ': 'Road ',
    'St ': 'Street ',
    'Pl ': 'Place ',
    'Ave ': 'Avenue ',
    'Rd,': 'Road ',
    'St,': 'Street ',
    'Pl,': 'Place ',
    'Ave,': 'Avenue ',
};

router.get('/', (req, res) => {
    if (req.session.searchlistings) {
        // Fix the multiple rendering crap
        if (req.session.renCount < 1) {
            req.session.renCount = 1;
            req.session.save();
            res.render('listings.ejs', { error: false, listings: [], user: req.session.user });
            return;
        }
        let listings = req.session.searchlistings;
        req.session.searchlistings = false;
        req.session.renCount = 0;
        let coords = req.session.coords;
        req.session.coords = {};
        req.session.save();
        if (listings.length == 0) {
            res.render('listings.ejs', { listings: [], error: false, noListings: true, user: req.session.user, coords: coords });
            return;
        }
        res.render('listings.ejs', { error: false, listings: listings.slice(0, MAX_SEARCH_RESULTS), user: req.session.user, coords: coords });
        return;
    }




    if (!req.session.location) {
        var ipAddr = req.headers["x-forwarded-for"];
        if (ipAddr) {
            var list = ipAddr.split(",");
            ipAddr = list[list.length - 1];
        } else {
            ipAddr = req.connection.remoteAddress;
            if (ipAddr == "::1") {
                ipAddr = '75.6.176.154'
            }
        }
        request('http://ip-api.io/api/json/' + ipAddr + '?fields=status,region,city,lat,lon')
            .then(response => {
                let info = JSON.parse(response);
                req.session.location = {
                    state: info.region_code,
                    city: info.city,
                    coords: info.latitude + "," + info.longitude
                };
                req.session.save();
                Listing.find({ state: req.session.location.state, city: req.session.location.city }, null, { sort: { numReviews: -1 } }, function (err, results) {
                    if (err) {
                        Listing.find({}, null, { sort: { numReviews: -1 } }, function (err, results) {
                            if (err) {
                                res.render('listings.ejs', { error: true, user: req.session.user });
                            }
                            else {
                                res.render('listings.ejs', { listings: results.slice(0, MAX_SEARCH_RESULTS), user: req.session.user, coords: req.session.location.coords });
                            }
                        });
                    }
                    else {
                        res.render('listings.ejs', { error: false, listings: results.slice(0, MAX_SEARCH_RESULTS), user: req.session.user, coords: req.session.location.coords });
                    }
                });
            })
            .catch(err => {
                Listing.find({}, null, { sort: { numReviews: -1 } }, function (err, results) {
                    if (err) {
                        console.log("Error getting listings");
                        res.render('listings.ejs', { error: true, user: req.session.user });
                    }
                    else {
                        res.render('listings.ejs', { error: false, listings: results.slice(0, MAX_SEARCH_RESULTS), user: req.session.user, coords: req.session.location.coords });
                    }
                }).limit(20);
            })
    }
    else {
        Listing.find({ state: req.session.location.state, city: req.session.location.city }, null, { sort: { numReviews: -1 } }, function (err, results) {
            if (err) {
                Listing.find({}, null, { sort: { numReviews: -1 } }, function (err, results) {
                    if (err) {
                        console.log("Error getting listings");
                        res.render('listings.ejs', { error: true, user: req.session.user });
                    }
                    else {
                        res.render('listings.ejs', { error: false, listings: results.slice(0, MAX_SEARCH_RESULTS), user: req.session.user, coords: req.session.location.coords });
                    }
                });
            }
            else {
                res.render('listings.ejs', { error: false, listings: results.slice(0, MAX_SEARCH_RESULTS), user: req.session.user, coords: req.session.location.coords });
            }
        });
    }
    // initially show only the results from my city, state

});

router.post('/listing/getreview', (req, res) => {
    let review = {};
    if (!req.body.id) {
        console.log('Error finding review - no ID')
        res.json(user);
        return;
    }
    Review.findById(req.body.id, function (err, getRev) {
        if (err || !getRev) {
            console.log('Error finding user for review')
        }
    }).then(result => {
        if (result) {
            review = result;
        }
        else {
            user = {
                username: "unknown"
            }
        }
        res.json(review);
    });

});

router.post('/getuser', (req, res) => {
    let user = {};
    if (!req.body.id) {
        console.log('Error finding user for review')
        res.json(user);
        return;
    }
    User.findById(req.body.id, function (err, getUser) {
        if (err || !getUser) {
            console.log('Error finding user for review')
        }
    }).then(result => {
        if (result) {
            user = {
                //id: result.id,
                username: result.username || "unknown",
                firstname: result.firstname || "Anon"
                //reviews: result.reviews
            };
        }
        else {
            user = {
                username: "unknown",
                firstname: "Anon"
            }
        }
        res.json(user);
    });

});
// Search handler

router.post('/search', (req, res) => {
    let address = req.body.address;
    let city = req.body.city;
    let state = req.body.state;
    if (!city || !state) {
        console.log("Search for address missing a criteria");
        res.redirect('/listings');
        return;
    }
    // Search by city
    if (!address) {

        Listing.find({ state: state, city: city }, null, { sort: { numReviews: -1 } }, function (err, results) {
            if (err) {
                console.log("Error getting listings");
                res.render('listings.ejs', { error: true, user: req.session.user, coords: req.session.location.coords });
            }
            else {
                // Get around the fetch glitch where we can't render from a fetch, must redirect instead
                req.session.searchlistings = results;
                req.session.renCount = 0;
                /* -=---=-== -= -= -= -= - =- =- =- =-  */
                req.session.city = city;
                req.session.state = state;
                req.session.coords = req.body.coords;
                res.redirect('/listings');
                return;
            }
        });
    }
    else {
        // Address, city, state
        Listing.findOne(
            {
                address: address,
                city: city,
                state: state
            },
            function (err, result) {
                if (err) {
                    console.log("Got an error searching for the address");
                    res.render('listing.ejs', { listing: false, error: true, user: req.session.user });
                }
                else {
                    if (result) {
                        res.redirect('/listings/listing/' + result._id);
                    }
                    else {
                        // Automatically add this new listing to the database when its searched for

                        if (!address) {
                            console.log("Could not add listing - address missing");
                            res.redirect('/listings/notfound');
                            return;
                        }
                        if (!state) {
                            console.log("Could not add listing - state missing");
                            res.redirect('/listings/notfound');
                            return;
                        }
                        if (!city) {
                            console.log("Could not add listing - city missing");
                            res.redirect('/listings/notfound');
                            return;
                        }
                        if (!req.body.validAddr) {
                            console.log("Could not add listing - invalid address. Perhaps the location is not a rental property");
                            res.redirect('/listings/notfound');
                            return;
                        }
                        let listingData = {
                            address: address,
                            state: state,
                            city: city,
                            reviews: [],
                            rating: 0,
                            numReviews: 0,
                            rateSum: 0,
                            coords: req.body.coords
                        }
                        Listing.create(listingData, (err, item) => {
                            if (err) {
                                console.log("Could not add listing", err);
                                res.json("Err")
                                return;
                            }
                            res.redirect('/listings/listing/' + item.id);
                        });
                    }
                }
            });
    }
});

router.get('/searchcity', (req, res) => {

});

router.get('/notfound', (req, res) => {
    res.render('listings.ejs', { listings: [], error: true, user: req.session.user });
});

// TIP: Here we used async function to loop through user reviews and find each review to find its listingid without rendering first
router.get('/listing/:listingid', (req, res, next) => {
    Listing.findById(req.params.listingid, async function (err, result) {
        if (err) {
            console.log("Error getting listing " + req.params.listingid);
            res.render('listing.ejs', { listing: false, error: true, user: req.session.user, reviewed: true });
        }
        else {
            // Make sure they haven't already made a review
            let reviewed = false;
            if (req.session.user) {
                for (let i = 0; i < req.session.user.reviews.length; i++) {
                    let review = await Review.findById(req.session.user.reviews[i].reviewId);
                    if (req.params.listingid == review.listingId) {
                        reviewed = true;
                    }
                }
                res.render('listing.ejs', { listing: result, user: req.session.user, reviewed: reviewed });
            }
            else {
                res.render('listing.ejs', { listing: result, user: req.session.user, reviewed: reviewed });
            }
        }
    });
});


router.post('/listing/review/:listingid', (req, res) => {
    let review = {};
    if (!req.session.user) {
        // This should redirect to login or make the login pop up
        res.redirect('/');
        return;
    }
    if (!req.body.rating) {
        res.render('listing.ejs', { listing: false, error: true, user: req.session.user });
        return;
    }
    // Disallow bad input
    if (req.body.title.length > 25) {
        req.body.title = req.body.title.substring(0, 25);
    }
    if ((req.body.title.length > 0 && req.body.title.length < 3) || req.body.rating < 0 || req.body.rating > 5) {
        console.log("Error adding a review for listing " + req.params.listingid + ". invalid input");
        res.redirect('/listings/listing/' + req.params.listingid);
        return;
    }

    if (req.body.comments.length > 3000) {
        console.log("Error adding a review for listing " + req.params.listingid + ". invalid input");
        res.redirect('/listings/listing/' + req.params.listingid);
        return;
    }

    // Don't allow comments but no title
    if (!req.body.title && req.body.comments) {
        console.log("Error adding a review for listing " + req.params.listingid + ". invalid input");
        res.redirect('/listings/listing/' + req.params.listingid);
        return;
    }

    // Make sure they haven't already made a review
    for (let i = 0; i < req.session.user.reviews.length; i++) {
        if (req.session.user.reviews[i].listingId == req.params.listingid) {
            console.log("Error adding a review for listing " + req.params.listingid + ". User has already reviewed this listing.");
            res.redirect('/listings/listing/' + req.params.listingid);
            return;
        }
    }

    let listingAdd;
    Listing.findById(req.params.listingid, function (err, result) {
        if (err) {
            console.log("Error adding a review for listing " + req.params.listingid + ". Cant find listing");
            res.redirect('/listings/listing/' + req.params.listingid);
            return;
        }
        listingAdd = result.address;
        if (!listingAdd) {
            console.log("Error adding a review for listing " + req.params.listingid + ". Cant find listing address");
            res.redirect('/listings/listing/' + req.params.listingid);
            return;
        }
        review = {
            listingId: req.params.listingid,
            listingAdd: listingAdd,
            userId: req.session.user._id,
            stars: req.body.rating,
            comments: req.body.comments.substring(0, 3000),
            title: req.body.title,
            upvotes: 0,
            date: new Date().toLocaleDateString()
        }

        Review.create(review, (err, item) => {
            if (err) {
                console.log("Error adding a review for listing " + req.params.listingid + ". Cant create review");
                res.redirect('/listings/listing/' + req.params.listingid);
                return;
            }
            review = item;
            let rating = 0.0;
            let userreview = {
                reviewId: review._id
            }
            Listing.findByIdAndUpdate(req.params.listingid,
                {
                    $push: { reviews: userreview }
                }, { new: true },
                function (err, result) {
                    if (err) {
                        console.log("Error adding a review for listing " + req.params.listingid + ". Cant find listing 2");
                        res.redirect('/listings/listing/' + req.params.listingid);
                        return;
                    }
                    else {
                        rating = (+result.rateSum + +req.body.rating) / result.reviews.length;
                        Listing.findByIdAndUpdate(req.params.listingid,
                            {
                                $set: { rating: rating, numReviews: result.reviews.length },
                                $inc: { rateSum: +req.body.rating },
                            }, { new: true },
                            function (err, result1) {
                                if (err) {
                                    console.log("Error adding a review for listing " + req.params.listingid + ". Cant find listing 3");
                                    res.redirect('/listings/listing/' + req.params.listingid);
                                    return;
                                }
                                else {
                                    User.findByIdAndUpdate(req.session.user._id,
                                        {
                                            $push: { reviews: userreview }
                                        }, { new: true },
                                        function (err, result) {
                                            if (err) {
                                                console.log("Error adding a review for listing " + req.params.listingid + " for user " + req.session.user._id);
                                                res.redirect('/listings/listing/' + req.params.listingid);
                                                return;
                                            }
                                            req.session.user.reviews = result.reviews;
                                            req.session.save();
                                            res.redirect('/listings/listing/' + req.params.listingid);
                                        });
                                }
                            });
                    }
                });
        });
    });
});


/*
    Replaced the add a listing function with auto add on search
*/
// router.get('/add', (req, res) => {
//     if (req.session.user) {
//         res.render('addListing.ejs', { user: req.session.user });
//     }
//     else {
//         res.redirect('/listings');
//     }
// });

// router.post('/add', (req, res) => {
//     let address = req.body.address;
//     let city = req.body.city;
//     let state = req.body.state;
//     if (!address) {
//         console.log("Could not add listing - address missing");
//         res.redirect('/add');
//         return;
//     }
//     if (!state) {
//         console.log("Could not add listing - state missing");
//         res.redirect('/add');
//         return;
//     }
//     if (!city) {
//         console.log("Could not add listing - city missing");
//         res.redirect('/add');
//         return;
//     }
//     let listingData = {
//         address: address,
//         state: state,
//         city: city,
//         reviews: [],
//         rateSum: 0
//     }
//     Listing.create(listingData, (err, item) => {
//         if (err) {
//             console.log("Could not add listing");
//             res.json("Err")
//             return;
//         }
//         res.redirect('/listings/listing/' + item.id);
//     });
// });

router.put('/listing/upvote', (req, res) => {
    let reviewId = req.body.reviewId;
    let user = req.session.user;
    //let upvoteId = req.body.upvoteId;
    let upvoting = true;
    for (let i = 0; i < user.upvotes.length; i++) {
        if (user.upvotes[i].reviewId == reviewId) {
            upvoting = false;
        }
    }
    if (upvoting) {
        User.findByIdAndUpdate(user._id,
            {
                $push: { upvotes: { reviewId: reviewId } }
            }, { new: true },
            function (err, result) {
                if (err) {
                    console.log("Error adding a review for listing " + req.params.listingid + " for user " + req.session.user._id);
                    res.redirect('/listings/listing/' + req.params.listingid);
                    return;
                }
                req.session.user.upvotes = result.upvotes;
                req.session.save();
                Review.findByIdAndUpdate(reviewId,
                    {
                        $inc: { upvotes: 1 }
                    }, { new: true },
                    function (err, result1) {
                        if (err) {
                            console.log("Error adding a review for listing " + req.params.listingid + " for user " + req.session.user._id);
                            res.redirect('/listings/listing/' + req.params.listingid);
                            return;
                        }
                        res.json(result1.upvotes);
                        return;
                        //res.render('listing.ejs', { listing: result1, user: req.session.user, reviewed: true });
                    });

                //res.render('listing.ejs', { listing: result1, user: req.session.user, reviewed: true });
            });
    }
    else {
        User.findByIdAndUpdate(user._id,
            {
                $pull: { upvotes: { reviewId: reviewId } }
            }, { new: true },
            function (err, result) {
                if (err) {
                    console.log("Error adding a review for listing " + req.params.listingid + " for user " + req.session.user._id);
                    res.redirect('/listings/listing/' + req.params.listingid);
                    return;
                }
                req.session.user.upvotes = result.upvotes;
                req.session.save();
                Review.findByIdAndUpdate(reviewId,
                    {
                        $inc: { upvotes: -1 }
                    }, { new: true },
                    function (err, result1) {
                        if (err) {
                            console.log("Error adding a review for listing " + req.params.listingid + " for user " + req.session.user._id);
                            res.redirect('/listings/listing/' + req.params.listingid);
                            return;
                        }
                        res.json(result1.upvotes);
                        return;
                        //res.render('listing.ejs', { listing: result1, user: req.session.user, reviewed: true });
                    });

                //res.render('listing.ejs', { listing: result1, user: req.session.user, reviewed: true });
            });
    }
});
