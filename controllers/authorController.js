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


//id here is taken from url (not sent by the form)
exports.author_delete_get = function(req, res, next) {
  async.parallel({
    author: function(callback) {
      Author.findById(req.params.id).exec(callback); //the parameter 'id' is specified in routes.js (using the form /:id/)
    }, 
    books: function(callback) {
      Book.find({ 'author': req.params.id }).exec(callback);
    }
  }, function(err, results) {
    if(err) { return next(err); }  //what does this do again?  Does it return back to app.js???  What's the flow of the program???
    if(results.author == null) {
      res.redirect('/catalog/authors');
    }
    res.render('author_delete', { title: 'Delete Author', books: results.books, author: results.author });
  });
}

//need to check authorid sent by form (why?)
exports.author_delete_post = function(req, res, next) {
  async.parallel({
    author: function(callback) {
      Author.findById(req.body.authorid).exec(callback);
    }, 
    authors_books: function(callback) {
      Book.find({ 'author': req.body.authorid }).exec(callback);
    }
  }, function(err, results) {
      if(err) { return next(err); }
      if(results.authors_books.length > 0) {
        res.render('author_delete', { title: 'Delete Author', books: results.authors_books, author: results.author });
        return;
      }else{
        //delete from database
        Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
          if(err) { return next(err); }
          res.redirect('/catalog/authors');
        });
      }
  });
}

exports.author_update_get = function(req, res, next) {
  Author.findById(req.params.id)
  .exec(function(err, author) {
    if(err) { return next(err); }
    res.render('author_form', { title: 'Edit author', author: author });
  });
}

exports.author_update_post = [
  //validate / sanitize inputs (thank god don't need to worry about populating checkbox/selector fields
  body('family_name').trim().isLength({min: 1}).escape().withMessage('Family name must be specified')
    .isAlphanumeric().withMessage('Family name contains non-alphanumeric characters'),
  body('first_name').trim().isLength({min: 1}).escape().withMessage('First name must be specified')
    .isAlphanumeric().withMessage('First name contains non-alphanumeric characters'),
  body('date_of_birth', 'Invalid date of birth').optional({checkFalsy: true}).isISO8601().toDate(),
  body('date_of_death', 'Invalid date of death').optional({checkFalsy: true}).isISO8601().toDate(),

  (req, res, next) => {
    const errors = validationResult(req);
    //create temp author entry
    const author = new Author({
      family_name: req.body.family_name,
      first_name: req.body.first_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
      _id: req.params.id
    });
    if(!errors.isEmpty()) {
      res.render('author_form', {title: 'Edit author', author: author, errors: errors.array()});
    }else{
      Author.findByIdAndUpdate(req.params.id, author, {}, function(err, theauthor) {
        if(err) { return next(err); }
        res.redirect(theauthor.url);
      });
    }
  }
];
