var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    }, 
    link: {
        type: String,
        required: true
    },
    note: {
        type: Schema.Types.ObjectId, 
        ref: 'Note'
    }
});

// Create a Note model using the NoteSchema
var Article = mongoose.model("Article", ArticleSchema);

// Export the Note model
module.exports = Article;