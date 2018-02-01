var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs  = require('express-handlebars');

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 8080;


// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
// var axios = require("axios");
// var cheerio = require("cheerio");

// Initialize Express
var app = express();

// Set up handlebars engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// By default mongoose uses callbacks for async queries, we're setting it to use promises (.then syntax) instead
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/news-scraperDB", {
  useMongoClient: true
});

// ------------------------------------------------------------------------------------------------------
// Note routes

// Reference home page
app.get("/", function(req, res) {
  db.Note.find().then(function(data){
        res.render("articles", {note: data});
  }).catch(function(err){
        res.json(err);
  });
});
// Find note by id
app.get("api/notes/:id", function(req, res) {
    db.Note.findById(req.params.id).then(function(data){
        res.json(data);
    }).catch(function(err){
        res.json(err);
    });
  });
app.post("api/notes",function(req, res){
    db.Note.create(req.body).then(function(data){
        res.json(data);
    }).catch(function(err){
        res.json(err);
    });
})



// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
