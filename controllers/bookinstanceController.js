const BookInstance = require('../models/bookinstance');
const Book  = require('../models/book');
const async = require('async');
const { body, validationResult } = require('express-validator');

exports.bookinstance_list = function(req, res) {
  BookInstance.find() //get all things? in BookInstance collection
    .populate('book') //populate book field of bookinstance with data from Book collection
    .exec(function(err, list_bookinstances) {
      if(err) { return next(err); }
      res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
    });
}

exports.bookinstance_detail = function(req, res, next) {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function(err, book_instance) {
      if(err) { return next(err); }
      //NEED to return error if book copy not found
      if(book_instance == null) {
        var err = new Error('Book copy not found');
        err.status = 404;
        return next(err);
      }
      res.render('bookinstance_detail', { book_instance: book_instance });
    });
}

exports.bookinstance_create_get = function(req, res, next) {
  Book.find()
    .sort([['title', 'ascending']])
    .exec( function(err, books) {
      if(err) { return next(err); }
      res.render('bookinstance_form', { title: 'Create BookInstance', books: books, statuses: BookInstance.schema.path('status').enumValues });
    });
}

exports.bookinstance_create_post = [
  body('book').trim().isLength({ min: 1 }).escape(),
  body('imprint', 'Imprint information is missing').trim().isLength({ min: 1}).escape(),
  body('status').escape(),
  body('due_back', 'Must specify date available').optional({checkFalsy: true}).isISO8601().toDate(),

  (req, res, next) => {
    const errors = validationResult(req);

    const bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back
    });
    
    if(!errors.isEmpty()) {
      Book.find()
      .sort([['title', 'ascending']])
      .exec( function(err, books) {
        if(err) { next(err); }
        res.render('bookinstance_form', { title: 'Create BookInstance', bookinstance: bookinstance, books: books, 
                    statuses: BookInstance.schema.path('status').enumValues, errors: errors.array()});
      });
    }else{
      bookinstance.save(function(err) {
        if(err) { return next(err); }
        res.redirect(bookinstance.url);
      });
    }
  }
];

exports.bookinstance_delete_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Author list');
}

exports.bookinstance_delete_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Author list');
}
exports.bookinstance_update_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Author list');
}
exports.bookinstance_update_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Author list');
}
