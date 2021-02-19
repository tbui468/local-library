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


exports.author_create_post = [
  //validate inputs - the first parameter we put into body matches 'name' attribute in html form
  body('family_name').trim().isLength({min: 1}).escape().withMessage('Family name must be specified.')
    .isAlphanumeric().withMessage('Family name contains non-alphanumeric characters.'),
  body('first_name').trim().isLength({min: 1}).escape().withMessage('First name must be specified.')
    .isAlphanumeric().withMessage('First name contains non-alphanumeric characters.'),
  body('date_of_birth', 'Invalid date of birth').optional({checkFalsy: true}).isISO8601().toDate(),
  body('date_of_death', 'Invalid date of death').optional({checkFalsy: true}).isISO8601().toDate(),
  (req, res, next) => {
    const errors = validationResult(req);
    
    if(!errors.isEmpty()) {
      res.render('author_form', { title: 'Add Author', author: req.body, errors: errors.array()});
      return;
    }else{
      //for now, allow duplicates of authors
      let author = new Author({
        family_name: req.body.family_name,
        first_name: req.body.first_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death
      }); 

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
