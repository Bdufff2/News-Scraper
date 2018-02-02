var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require('express-handlebars');

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 8080;


// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

// Set up handlebars engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
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
app.get("/", function (req, res) {
    db.Note.find().then(function (data) {
        res.render("index", { note: data });
    }).catch(function (err) {
        res.json(err);
    });
});
// View saved articles


// Scrape data route
app.get("/api/scrape", function (req, res) {
    // First, we grab the body of the html with request
    axios.get("https://www.nytimes.com/").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);
        var result = {};
        // Now, we grab every h2 within an article tag, and do the following:
        $(".story-heading").each(function (i, element) {
            
            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            // Create a new Article using the `result` object built from scraping
                db.Article.create(result)
                  .then(function(dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                  }).catch(function(err) {
                    // If an error occurred, send it to the client
                    return res.json(err);
                  });
            
        });
        console.log(result);
        // If we were able to successfully scrape and save an Article, send a message to the client
        res.send("Scrape Complete");
    });
});


// Find note by id
app.get("/api/notes/:id", function (req, res) {
    db.Note.findById(req.params.id).then(function (data) {
        res.json(data);
    }).catch(function (err) {
        res.json(err);
    });
});
// post a not about an article
app.post("/api/notes", function (req, res) {
    db.Note.create(req.body).then(function (data) {
        res.json(data);
    }).catch(function (err) {
        res.json(err);
    });
});
// delete an article from saved page
app.post("/api/article/delete", function (req, res) {
    db.article.findByIdAndRemove(req.body.id).then(function (data) {
        res.json(data);
    }).catch(function (err) {
        res.json(err);
    });
})

app.post("/saved", function (req, res) {
    db.article.findByIdAndRemove(req.body.id).then(function (data) {
        res.json(data);
    }).catch(function (err) {
        res.json(err);
    });
})

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
