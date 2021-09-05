const express = require("express");
const { ResumeToken } = require("mongodb");
let router = express.Router();
module.exports = router;
const mongoose = require('mongoose');
const Quote = mongoose.model('Quote');

router.get('/', (req, res) => {
    Quote.find({}, function (err, results) {
        res.render('quotes', { quotes: results });
    });
})

router.post('/addquote', (req, res) => {
    let name = req.body.name;
    let quote = req.body.quote;
    if (!name) {
        console.log("Could not add Quote - name missing");
        res.redirect('/quotes');
        return;
    }
    
    if(!quote){
        console.log("Could not add Quote - quote missing");
        res.redirect('/quotes');
        return;
    }
    let quoteData = {
        name: name,
        quote: quote
    }
    Quote.create(quoteData, (err) =>{
        if (err) {
            console.log("Could not add entry - required values missing");
        }
        res.redirect('/quotes');
    });
});

router.put('/changequote', (req, res) => {
    Quote.findOneAndUpdate(
        {
            name: 'Yoda'
        },
        {
            name: req.body.name,
            quote: req.body.quote
        }
    ).then(result => {
        if (!result) {
            return res.json('No quote to update')
        }
        res.redirect('/quotes');
    })
        .catch(error => console.error(error));
});

router.delete('/deletequote', (req, res) => {
    Quote.deleteOne(
        { _id:  req.body.id }
    )
        .then(result => {
            // If there are no more to delete, send a message back to the browser to tell it that
            if (result.deletedCount === 0) {
                return res.json('No quote to delete')
            }
            res.redirect('/qoutes');
        })
        .catch(error => console.error(error))
});