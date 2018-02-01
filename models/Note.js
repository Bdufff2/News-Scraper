var mongoose = require("mongoose");

var Schema = mongoose.schema;

var NoteSchema = new Schema({
    title: String,
    body: String
});

var note = mongoose.model("Note", NoteSchema);

module.exports = Note;