const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let BookSchema = new Schema(
  {
    title: {type: String, required: true},
    author: {type: Schema.Types.ObjectId, ref: 'Author', required: true},
    summary: {type: String, required: true},
    isbn: {type: String, required: true},
    genre: [{type: Schema.Types.ObjectId, ref: 'Genre'}] //this is an array of mongoDB ids (belonging to genre entries)
  }
);

BookSchema
.virtual('url')
.get(function() {
  return '/catalog/book/' + this._id;
});

module.exports = mongoose.model('Book', BookSchema);


