const Genre = require('../models/genre');
const Book = require('../models/book');
const async = require('async');
const { body, validationResult } = require('express-validator');
/*//same as:
  const validator = require('express-validator');
  const body = validator.body();
  const validationResult = validator.validationResults();
 */

exports.genre_list = function(req, res) {
  Genre.find()
    .sort([['name', 'ascending']])
    .exec(function(err, results) {
      if(err) { return next(err); }
      res.render('genre_list', {title: 'Genre List', genres_list: results});
    });
}

exports.genre_detail = function(req, res, next) {
  async.parallel({
    genre: function(callback) {
      Genre.findById(req.params.id)
        .exec(callback);
    },
    genre_books: function(callback) {
      Book.find({ 'genre': req.params.id })
        .exec(callback);
    },
  }, function(err, results) {
    if(err) { return next(err); }
    if(results.genre == null) { //no results
      let err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    }
    //success!
    res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books });
  });
}

exports.genre_create_get = function(req, res) {
  res.render('genre_form', { title: 'Create Genre' });
}

//note: passing an array of functions to be called in sequence (the middleware)
exports.genre_create_post = [
  body('name', 'Genre name required').trim().isLength({min: 1}).escape(), //first function
  (req, res, next) => { //second function
    //extract validation errors from a request
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
      //resend forms with errors/sanitized values
      res.render('genre_form', { title: 'Create Genre', genre: req.body.name, errors: errors.array()});
      return;
    }else{
      //check if genre alread exists in database,
      //if not, add to database
      Genre.findOne({'name': req.body.name})
        .exec(function(err, found_genre) {
          if(err) { return next(err); }

          if(found_genre) {
            res.redirect(found_genre.url);
          }else{
            let genre = new Genre(
              { name: req.body.name }
            );
            genre.save(function(err) { //save the genre instance we created to database
              if(err) { return next(err); }
              res.redirect(genre.url);
            });
          }
        });
    }
  }
];

exports.genre_delete_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Author list');
}

exports.genre_delete_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Author list');
}

exports.genre_update_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Author list');
}

exports.genre_update_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Author list');
}
