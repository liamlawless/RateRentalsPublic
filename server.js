const mongoose = require('mongoose');
// Require express
const express = require('express');
const app = express();
// Create a server the browser can connect to
app.listen(process.env.PORT || 3000, function () {
    console.log('listening on port 3000');
})

// Import express sessions for login and stuff
const session = require('express-session');
app.use(session({
    secret: "afasfaeacydgwerv423d131asf", // Encrypt the session data in the sesison
    resave: false, // Resave the session after every change
    saveUninitialized: true // Save uninitiallized objects in the session
}));
// Allows us to render the quotes in the HTML dynamically
app.set('view engine', 'ejs');

// Make sure you place body-parser before your CRUD handlers!
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))

// So our server can accept JSON data
app.use(bodyParser.json());

// Tell Express to use main file
app.use(express.static('public'));

const connectionString = process.env.MONGO_KEY;
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
require("./models/user.model");
require("./models/listings.model");
require("./models/review.model");
// Use quotes to handle endpoints that starts with quotes

const users = require("./routes/users");
app.use("/users", users);

const listings = require("./routes/listings");
app.use("/listings", listings);
const request = require('request-promise');

// GET request for main page
app.get('/', (req, res) => {
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
    // Force Madison, WI on load since its the only place with data entries right now
    ipAddr = '75.6.176.154'
    if (!req.session.location) {
        request('http://ip-api.io/api/json/' + ipAddr + '?fields=status,region,city,lat,lon')
            .then(response => {
                let info = JSON.parse(response);
                req.session.location = {
                    state: info.region_code,
                    city: info.city,
                    coords: info.latitude + "," + info.longitude
                };
                req.session.save();
            })
            .catch(err => console.log(err))
    }
    res.render('index.ejs', { user: req.session.user });
    // Open up an index.html file page
    // Get the items from our database using find
});

app.get('/logout', (req, res) => {
    req.session.user = null;
    res.redirect('/');
})


// var ObjectID = require('mongodb').ObjectID;
// /* MONGODB
// - We need to connect to MongoDB Atlas where the stuff is stored on the web
// - We use the connection string from that website
// - We need to make the db variable
// - We must put our requests in the .then (promise) of the Mongo connect
// - We change items by using findOneAndUpdate function
//     quotesCollection.findOneAndUpdate(
//     query,
//     update,
//     options
//     )
//     .then(result => {})
//     .catch(error => console.error(error))
//         - Query lets us filter the collections with key-value pairs
//         - If we want to filter the quotes by those written by Yoda, we can set {name: Yoda} as the query
//         - Update tells MongoDB what to change, using $set, $inc, $push
//         - Options lets us set certian mongo options
//             - We can force the DB to make a new entry if it cant find the one were looking for with options as
//             {
//                 upsert: true
//             }
// - We delete items from the collection using deleteOne
//     - It takes two parameters: query and options
//     - query: works like query in findOneAndUpdate
//     - Lets us filter the collections for entries we're searching for

// */
// const connectionString = 'mongodb+srv://Liam:LiamDBPassword@cluster0.bocmk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
// // Connect to the MongoDB through the MongoClient's connect method
// const MongoClient = require('mongodb').MongoClient;
// MongoClient.connect(connectionString, { useUnifiedTopology: true }).then(client => {
//     console.log('Connected to Database');
//     const db = client.db('NewProject');

//     // Create a collection (a collection is a table)
//     const quotesCollection = db.collection('quotes');
//     /*
//     - Create (POST) - Make something
//         - Can be sent through javascript or through a form element
//         - Form element requires three things
//             - Action attribute: tells the browser where to send the post
//             - Method attribute: tells the browsers what kind of request to send
//             - Name attributes on each <input> element
//         - Handle post requests in server.js (the path should be the same as Action)
//         - We cannot handle the data sent through POST without middleware
//             - Middleware tidies up the request object before we use it
//             - We use body-parser
//     - Read (GET)- Get something
//         - Browsers perform GET request when you visit a website
//         - We handle GET request with a get method
//             app.get(endpoint, callback function(req, res))
//         - Endpoint is the requested endpoint, the value that comes after your domain
//             - Example: localhost:3000 is localhost:3000/ which is main
//             - https://zellwk.com/blog/crud-express-mongodb/ is domain zellwk.com and the endpoint is /blog/crud-express-mongodb
//         - Callback tells the server what to do when the requested endpoint mathces the endpoint stated
//         - req is the request object and res is the response object
//         - res.render(view, locals)
//             - View is the name of the file we're rendering, must be placed in the views folder
//             - Locals is the data being passed to the file
//     - Update (PUT) - Change something
//         - Can be triggered through JS or <form>
//         - We create a button in the ejs file to change a quoute
//         - We need to create an exernal JS file to execute a PUT request (main.js)
//             - According to Express conventions this JS file is kept in a folder called public
//             - Tell Express to make this public folder accessible to the public by using built in middleware express.static('public')
//         - Need to send PUT request when button is clicked, so we need a click event in main.js
//         - Easiest way to trigger a PUT request is Fetch API
//             - fetch(endpoint, options)
//             - Modern apps send and receive JSON to servers (JavaScript Object Notation)
//                 - They're like JS objects but each proprety and value written between quotations
//                 - Example
//                 const data = { JS
//                     name: 'Darth Vadar',
//                     quote: 'I find your lack of faith disturbing.'
//                 }
//                 { JSON
//                     "name": "Darth Vadar",
//                     "quote": "I find your lack of faith disturbing."
//                 }
//             - Must tell server we are sending JSON data by setting Content-type header to application/json
//             - Must convert the data we send into JSON with JSON.stringify, pass it by the body function
//         - Then we handle the PUT request with a put method
//         - We also need to handle the response from the server via a then object in Main.js where we sent the PUT
//     - Delete (DELETE)- Remove something
//         - Similar to UPDATE request
//         - Add a delete button and then handle it in main.js with another fetch
//         - We send just the name so the DB can delete it
//         - We handle this delete on the server side with app.delete
//     */


// todo: 


// Bugs:
// Mobile doesn't have the nice scrolling thing because can't detect scroll bar on mobile
// Fixed Bugs:
// Can add another review to the same listing as long as you log out and back in
// Doesn't show amount of upvotes if not logged in
// Address is unique, cannot have same address in different city/state
// After searching for madison, trying to search again gets a RefererNotAllowedMapError
    // if you start typing too fast after searching
// Reload resubmits form (just had to redirect rather than re render)
// Username is caps sensitive: made register and login force username to lowercase
