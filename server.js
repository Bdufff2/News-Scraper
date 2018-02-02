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

// ---------------------------------------------------------------
// Routes
// ---------------------------------------------------------------

// Reference home page
app.get("/", function (req, res) {
    db.Note.find().then(function (data) {
        res.render("index", { note: data });
    }).catch(function (err) {
        res.json(err);
    });
});

// View saved articles
app.get("/saved", function (req, res) {
    Article.find({ "saved": true }).populate("notes").exec(function (error, articles) {
        var hbsObject = {
            article: articles
        };
        res.render("saved", hbsObject);
    });
});

// Scrape data using GET request
app.get("/api/scrape", function (req, res) {
    // First, we grab the body of the html with request
    axios.get("https://www.nytimes.com/").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);
        console.log(response.data);
        var result = {};
        // Now, we grab every h2 within an article tag, and do the following:
        $("article").each(function (i, element) {
            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children(".story-heading")
                .children("a")
                .text();
            result.summary = $(this)
                .children(".summary")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                }).catch(function (err) {
                    // If an error occurred, send it to the client
                    return res.json(err);
                });
        });

        console.log(result);
        // If we were able to successfully scrape and save an Article, send a message to the client
        res.send("Scrape Complete");
    });
});

// Get route that pulls all articles from the db
app.get("/articles", function (req, res) {
    db.Article.find({}, function (error, data) {
        if (error) {
            console.log(error);
        } else {
            res.json(data);
        }
    });
});

// GET request to retreive articles from db by ObjectId
app.get("/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ "_id": req.params.id })
        // ..and populate all of the notes associated with it
        .populate("note")
        // now, execute our query
        .exec(function (error, doc) {
            // Log any errors
            if (error) {
                console.log(error);
            }
            // Otherwise, send the doc to the browser as a json object
            else {
                res.json(doc);
            }
        });
});





// Post request to save articles 
app.post("/api/articles/save/:id", function (req, res) {
    db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true })
        .then(function (data) {
            res.json(data);
        }).catch(function (err) {
            res.json(err);
            console.log(err);
        });
});

// Post request to delete an article from the saved articles
app.post("/articles/delete/:id", function (req, res) {
    // Use the article id to find and update its saved boolean
    db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": false, "notes": [] })
        .then(function (data) {
            res.json(data);
        }).catch(function (err) {
            res.json(err);
            console.log(err);
        });
});




// Post request to create a new note for an article
app.post("/api/notes/new/:id", function (req, res) {
    var newNote = new Note({
        body: req.body.text,
        article: req.params.id
    });
    console.log(req.body);
    db.Note.create(req.body).then(function (data) {
        res.json(data);
    }).catch(function (err) {
        res.json(err);
    });
});


// need to create a route to delete a note

// app.delete("/api/notes/delete/:note_id", function (req, res) {
//     db.Note.findById(req.params.id).then(function (data) {
//         res.json(data);
//     }).catch(function (err) {
//         res.json(err);
//     });
// });





// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
