const express = require("express");
var nodemailer = require('nodemailer');
let router = express.Router();
module.exports = router;
const url = require('url');
// Mongoose
let mongoose = require('mongoose');
const { EDESTADDRREQ } = require("constants");
const User = mongoose.model('User');
const Listing = mongoose.model('Listing');
const Review = mongoose.model('Review');
// Login handler
router.post('/login', (req, res) => {
    let username = req.body.username.toLowerCase();;
    let password = req.body.password;
    User.findOne(
        { $or: [{ username: username, password: password }, { email: username, password: password }] },
        (err, user) => {
            if (err || !user) {
                console.log("Error logging in - incorrect username or password");
                res.json("error");
            }
            else {
                req.session.user = user;
                res.json("success");
            }
        }
    );
});


// Create user handler
router.post('/register', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let newUser = {
        username: username,
        password: password,
        email: email,
        firstname: firstname,
        lastname: lastname
    };
    User.create(newUser, (err, user) => {
        if (err) {
            console.log("Error registering user");
            res.json("error");
            return;
        }
        else {
            req.session.user = user;
            res.json("success");
            return;
        }
    });
});

router.get('/profile', (req, res) => {
    if (!req.session.user) {
        res.redirect('/')
    }
    else {
        res.render('profile.ejs', { user: req.session.user });
    }
});

router.post('/profile/delReview', (req, res) => {
    // Prevent bad input
    if (!req.session.user) {
        res.redirect('/');
        return;
    }
    if (!req.body.rid || !req.body.uid || !req.body.listingId) {
        console.log("Error removing a review for listing " + req.params.listingid + " for user " + req.session.user._id + ". Missing ids");
        res.redirect('/users/profile');
        return;
    }
    User.findByIdAndUpdate(req.session.user._id,
        {
            $pull: { reviews: { reviewId: req.body.rid } }
        }, { safe: true, upsert: true, new: true },
        function (err, result) {
            if (err) {
                console.log("Error removing a review for listing " + req.params.listingid + " for user " + req.session.user._id);
                res.redirect('/users/profile');
                return;
            }
            req.session.user.reviews = result.reviews;
            req.session.save();
            Listing.findByIdAndUpdate(req.body.listingId,
                {
                    $pull: { reviews: { reviewId: req.body.rid } },
                    $inc: { rateSum: -1 * req.body.rating },
                }, { safe: true, upsert: true, new: true },
                function (err, result1) {
                    if (err) {
                        console.log("Error removing a review for listing " + req.params.listingid + " for user " + req.session.user._id);
                        res.redirect('/users/profile');
                        return;
                    }
                    let rating = (+result1.rateSum) / result1.reviews.length;
                    if (result1.reviews.length < 1) {
                        rating = 5;
                    }
                    Listing.findByIdAndUpdate(req.body.listingId,
                        {
                            $set: { rating: rating, numReviews: result1.reviews.length },
                        }, { new: true },
                        function (err, result2) {
                            if (err) {
                                console.log("Error removing a review for listing " + req.params.listingid + " for user " + req.session.user._id);
                                res.redirect('/users/profile');
                                return;
                            }
                            Review.findByIdAndDelete(req.body.rid, function (err, docs) {
                                if (err) {
                                    console.log(err)
                                }
                                res.redirect('/users/profile');
                            });
                        });
                });
        });
});

router.put('/profile/editReview', (req, res) => {
    let title = req.body.title;
    let stars = req.body.stars;
    let comments = req.body.comments;
    if (title.length > 25 || title.length < 3) {
        console.log("Error editing review " + req.body.id + " for user " + req.session.user._id + ": Invalid input");
        res.json("err");
        return;
    }
    if (stars < 0 || stars > 5 || comments.length > 1000) {
        console.log("Error editing review " + req.body.id + " for user " + req.session.user._id + ": Invalid input");
        res.json("err");
        return;
    }
    // Update the review
    Review.findByIdAndUpdate(req.body.id,
        {
            $set: {
                title: req.body.title,
                stars: req.body.stars,
                comments: req.body.comments,
                date: new Date().toLocaleDateString()
            },
        }, { new: true },
        function (err, result) {
            if (err) {
                console.log("Error editing review " + req.body.id + " for user " + req.session.user._id);
                res.json({ err: err });
                return;
            }
            let inc = (-1 * +req.body.oldStars) + +req.body.stars;
            Listing.findByIdAndUpdate(req.body.listingId,
                {
                    $inc: { rateSum: inc }
                }, { new: true },
                function (err, result) {
                    if (err) {
                        console.log("Error updating stars for listing " + req.body.listingId + " for user " + req.session.user._id);
                        res.redirect('/users/profile');
                        return;
                    }
                    rating = (+result.rateSum) / result.reviews.length;
                    Listing.findByIdAndUpdate(req.body.listingId,
                        {
                            $set: { rating: rating },
                        }, { new: true },
                        function (err, result1) {
                            if (err) {
                                console.log("Error updating stars for listing " + req.body.listingId + " for user " + req.session.user._id);
                                res.redirect('/users/profile');
                                return;
                            }
                            else {
                                res.json("OK");
                            }
                        });
                });

        });

});

router.get('/password', (req, res) => {
    if (!req.session.user) {
        res.redirect('/')
    }
    else {
        res.render('changepass.ejs', { user: req.session.user });
    }
});

router.put('/password/change', (req, res) => {
    let newpass = req.body.newpass;
    if (newpass == req.session.user.password) {
        return res.json("Samepass")
    }
    User.findByIdAndUpdate(req.session.user._id, {
        $set: { password: newpass },
    }, { new: true },
        function (err, result) {
            if (err) {
                console.log("Error updating password for user " + req.session.user._id);
                res.redirect('/users/password');
                return;
            }
            else {
                req.session.user.password = newpass;
                req.session.save();
                return res.json("Good");
            }
        });
});

router.get('/forgotpass', (req, res) => {
    res.render('forgotPass.ejs', { user: req.session.user });
});

router.post('/forgotpass/email', (req, res) => {
    let email = req.body.email;
    User.findOne(
        { email: email },
        (err, user) => {
            if (err || !user) {
                console.log("Error getting account with email " + email);
                res.json("error");
            }
            else {
                req.session.code = Math.floor(Math.floor(Math.random() * 90000) + 10000);
                req.session.email = email;
                req.session.save();
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'lmczpvp@gmail.com',
                        pass: 'liamandseamus'
                    }
                });

                var mailOptions = {
                    from: 'lmczpvp@gmail.com',
                    to: email,
                    subject: 'Forgot password',
                    text: 'Here is the code to reset your password:' + req.session.code
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log("Error sending a recovery email to " + email);
                        res.json("error");

                    } else {
                        console.log('Email sent: ' + info.response);
                        res.json("success");
                    }
                });

            }
        }
    );
});

router.post('/forgotpass/verify', (req, res) => {
    let code = req.body.code;
    if (req.session.code == code) {
        User.findOne(
            { email: req.session.email },
            (err, user) => {
                if (err || !user) {
                    console.log("Error getting account with email " + email);
                    res.json("error");
                }
                else {
                    req.session.user = user;
                    req.session.save();
                    res.json("success");
                }
            }
        );
    }
    else {
        res.json("error");
    }
});

router.post('/profile/delacc', (req, res) => {
    // Remove each of the user's upvotes on other reviews
    let upvotes = req.session.user.upvotes;
    for (let i in upvotes) {
        Review.findByIdAndUpdate(upvotes[i].reviewId,
            {
                $inc: {
                    upvotes: -1
                }
            }, {new:true}, (err, review) => {
                
            });
    }
    // Delete each of the user's reviews and remove each review from its listing
    let reviews = req.session.user.reviews;
    for (let i in reviews) {
        Review.findByIdAndDelete(reviews[i].reviewId,
            (err, review) => {
                if (!err) {
                    Listing.findByIdAndUpdate(review.listingId,
                        {
                            $pull: { reviews: { reviewId: review._id } },
                            $inc: { rateSum: -1 * review.stars },
                        }, { safe: true, upsert: true, new: true },
                        function (err, listing) {
                            if (err) {
                                console.log("Error removing a review for listing " + review.listingId + " for user " + req.session.user._id);
                            }
                            let rating = (+listing.rateSum) / listing.reviews.length;
                            if (listing.reviews.length < 1) {
                                rating = 5;
                            }
                            Listing.findByIdAndUpdate(review.listingId,
                                {
                                    $set: { rating: rating, numReviews: listing.reviews.length },
                                }, { new: true },
                                function (err) {
                                    if (err) {
                                        console.log("Error removing a review for listing " + review.listingId + " for user " + req.session.user._id);
                                    }
                                });
                        });
                }
            });
    }

    // Remove the user from the database
    User.findByIdAndDelete(req.session.user._id, (err) => {
        if(err){
            console.log("Error deleting user " + req.session.user._id);
        }
    });
    req.session.user = null;
    res.redirect('/');
});