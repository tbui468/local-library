const Author = require('../models/author');
const Book = require('../models/book');
const async = require('async');
const { body, validationResult } = require('express-validator'); 

//order here doesn't matter, but when declaring routes in catalog.js, the order matters since /author/create and /author/id could clash

exports.author_list = function(req, res) {
  Author.find()
  .sort([['family_name', 'ascending']])
  .exec(function(err, authors_list) {
    if(err) { return next(err); }
    res.render('author_list', { title: 'Author List', authors_list: authors_list });
  });

}

exports.author_detail = function(req, res, next) {
  //fill this in
  //return author and book_list
  async.parallel( {
    author: function(callback) {
      Author.findById(req.params.id)
      .exec(callback);
    },
    book_list: function(callback) {
      Book.find({ 'author': req.params.id }, 'summary title')
      .exec(callback);
    }
  }, function(err, results) {
    //check for errors
    if(err) { return next(err); } //this is a check for database reading errors
    //check if resulting author is null
    if(results.author == null) { //this checks if data is not in database (not necessarily a techincal error)
      let err = new Error('Author not found');
      err.status = 404;
      return next(err);
    }
    //send response
    res.render('author_detail', { author: results.author, book_list: results.book_list });
  });
}

exports.author_create_get = function(req, res) {
  res.render('author_form', { title: 'Add author' } );
}

/*
  body('name', 'Genre name required').trim().isLength({min: 1}).escape(), //first function
  (req, res, next) => { //second function
    //extract validation errors from a request
    const errors = validationResult(req);
    //create Genre object using sanitised data
    let genre = new Genre(
      { name: req.body.name }
    );

    if(!errors.isEmpty()) {
      //resend forms with errors/sanitized values
      res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array()});
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
            genre.save(function(err) { //save the genre instance we created to database
              if(err) { return next(err); }
              res.redirect(genre.url);
            });
          }
        });
    }
  }*/

exports.author_create_post = [
  //validate inputs
  body('family_name', 'Family name required').trim().isLength({min: 1}).escape(),
  body('first_name', 'First name required').trim().isLength({min: 1}).escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    //if validation failed, return form (with new default inputs)
    //create Author object now bc I may want to update forms with incorrect answers user put in as feedback
    let author = new Author({
      family_name: req.body.family_name,
      first_name: req.body.first_name,
      date_of_birth: new Date(), //temp
      date_of_death: new Date()
    }); //temp
    
    if(!errors.isEmpty()) {
      res.render('author_form', { title: 'Add Author', author: author, errors: errors.array()});
      return;
    }else{
      //for now, allow duplicates of authors
      author.save(function(err) {
        if(err) { return next(err); }
        res.redirect(author.url);
      });
    }
  }
];

/*
exports.author_create_post = function(req, res) {
}*/

exports.author_delete_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Author list');
}
exports.author_delete_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Author list');
}
exports.author_update_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Author list');
}
exports.author_update_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Author list');
}
