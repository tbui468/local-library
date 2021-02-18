const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');

const async = require('async');

exports.index = function(req, res) {

  async.parallel({
    //all the callbacks here
    book_count: function(callback) {
      Book.countDocuments({}, callback);
    },
    book_instance_count: function(callback) {
      BookInstance.countDocuments({}, callback);
    },
    book_instance_available: function(callback) {
      BookInstance.countDocuments({status: 'Available'}, callback);
    },
    author_count: function(callback) {
      Author.countDocuments({}, callback);
    },
    genre_count: function(callback) {
      Genre.countDocuments({}, callback);
    }
  }, function(err, results) {
      res.render('index', { title: 'Local Library Home', error: err, data: results });
  });

}
exports.book_list = function(req, res) {
  Book.find({}, 'title author') //find all titles and author of books
    .sort([['title', 'ascending']])
    .populate('author') //take author entry and populate with values from author model
    .exec(function (err, list_books) { //function call to return html template using list_books
      if(err) {return next(err); }
      //successful
      res.render('book_list', { title: 'Book List', book_list: list_books});
    });

}
exports.book_detail = function(req, res, next) {
  //find book with id AND find bookinstance.book.id is the same
  async.parallel({
    book: function(callback) {
      Book.findById(req.params.id)
      .populate('author')
      .populate('genre')
      .exec(callback);
    },
    copy_list: function(callback) { //how do I only grab book instances where bookinstance.book.id == req.params.id
      BookInstance.find({'book': req.params.id})
      .exec(callback);
    }
  }, function(err, results) {
    if(err) { return next(err); }
    if(results.book == null) { //no results
      let err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }
    //success!
    res.render('book_detail', { title: results.book.title, book: results.book, copy_list: results.copy_list });
  });

}
exports.book_create_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Author list');
}
exports.book_create_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Author list');
}
exports.book_delete_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Author list');
}
exports.book_delete_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Author list');
}
exports.book_update_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Author list');
}
exports.book_update_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Author list');
}
