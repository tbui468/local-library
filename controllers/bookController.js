const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');
const { body, validationResult } = require('express-validator');

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

exports.book_create_get = function(req, res, next) {
  async.parallel({
    author_list: function(callback) {
      Author.find()
      .sort([['family_name', 'ascending']])
      .exec(callback);
    },
    genre_list: function(callback) {
      Genre.find()
      .sort([['name', 'ascending']])
      .exec(callback);
    }
  }, function(err, results) {
    if(err) { return next(err); }
    res.render('book_form', { title: 'Add New Book', author_list: results.author_list, genre_list: results.genre_list });
  });
}

//how to get authors and genres list again???
exports.book_create_post = [
  //need to deal with checkboxes here
  (req, res, next) => {
    //if not an array, make it one (empty or otherwise)
    if(!(req.body.genre instanceof Array)) {
      if(typeof req.body.genre === 'undefined') {
        req.body.genre = [];
      }else{
        req.body.genre = new Array(req.body.genre);
      }
    }
    next();
  },

  body('title', 'Book must have title').trim().isLength({ min: 1 }).escape(),
  body('summary', 'Book must have summary').trim().isLength({ min: 1 }).escape(),
  body('isbn', 'Book must have ISBN').trim().isLength({ min: 1 }).escape(),
  body('author_id', 'Book must have author').trim().isLength({ min: 1}).escape(),
  body('genre.*').escape(), //.* means sanitize all fields/value in genre (an array in this case)

  (req, res, next) => {
    const errors = validationResult(req);
    
    //create Book entry here so that it can be used in case of error (otherwise we could just put it in the no-error else path below)
    let book = new Book({
      title: req.body.title,
      author: req.body.author_id,   //note: book model stores mongoDB id in field 'author'
      summary: req.body.summary, 
      isbn: req.body.isbn, 
      genre: req.body.genre,  //need to get array? of genre checkboxes
    });

    if(!errors.isEmpty()) {
      async.parallel({ //takes a group of functions (surrounded by {}, and then a final function)
        author_list: function(callback) {
          Author.find()
            .sort([['family_name', 'ascending']])
            .exec(callback);
        },
        genre_list: function(callback) {
          Genre.find()
            .sort([['name', 'ascending']])
            .exec(callback);
        }
      }, function(err, results) {
          if(err) { return next(err); }

          //check boxes
          //note 1: book.genre is an array of genre ids in temp book entry we created
          //note 2: results.genre_list is an array of genres from our database
          for(let i = 0; i < results.genre_list.length; i++) {
            if(book.genre.indexOf(results.genre_list[i]._id) > -1) {
              results.genre_list[i].checked = 'true'; //can we just do this????  Adding a field and value.  Doesn't exist otherwise
            }
          }
        
        //  res.render('book_form', { title: 'Add New Book', book_title: book.title, book_summary: book.summary, book_isbn: book.isbn, 
         //             author_list: results.author_list, genre_list: results.genre_list, errors: errors.array()});

          res.render('book_form', { title: 'Add New Book', book: book, author_list: results.author_list, genre_list: results.genre_list, errors: errors.array()});

          return;
      });
    }else{
      //save to db and redirect
      book.save(function(err) {
        if(err) { return next(err); }
        res.redirect(book.url);
      });
    }
  }
];

exports.book_delete_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Author list');
}

exports.book_delete_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Author list');
}

exports.book_update_get = function(req, res, next) {
  async.parallel({
    book: function(callback) {
      Book.findById(req.params.id).exec(callback);
    },
    authors: function(callback) {
      Author.find()
        .sort([['family_name', 'ascending']])
        .exec(callback);
    },
    genres: function(callback) {
      Genre.find()
        .sort([['name', 'ascending']])
        .exec(callback);
    }
  }, function(err, results) {
    if(err) { return next(err); }

    //NEED THIS TO HANDLE WHEN DATA IS NOT FOUND!!!!  
    //use this format on detail pages (index pages display all so not found is not possible (only empty array))
    //create pages aren't reading from db, so also not needed
    //delete, update populate from DB, so always need to check if query result returns anything or a null
    if(results.book == null) {
      let err = new Error('Book not found');
      err.status = 404;
      return next(err);
    }

    for(let i = 0; i < results.genres.length; i++) {
      if(results.book.genre.indexOf(results.genres[i]._id) > -1) {
        results.genres[i].checked = 'true'; //can we just do this????  Adding a field and value.  Doesn't exist otherwise
      }
    }
    res.render('book_form', { title: 'Edit Book', book: results.book, author_list: results.authors, genre_list: results.genres });
  });
}

exports.book_update_post = [
  // use entry.save() to create in database
  // use Schema.findByIdAndRemove() to delete from database
  // use Schema.findByIdAndUpdate() to update in database

  //change checkboxes (all html attribute name='genre') to array
  //seems like instanceof checks if for prototype (superclass) too
  //whereas typeof only checks for specific type
  //according to upvoted stackoverflow answer, use instanceof for custom/complex types and use typeof for built-in/primitive types
  (req, res, next) => {
    if(!(req.body.genre instanceof Array)) { //if not array, make it one
      if(typeof req.body.genre === 'undefined') {
        req.body.genre = []; //set to empty array
      }else{
        req.body.genre = new Array(req.body.genre); //make genre key-value pairs into array (req.body.genre is submitted to server as { 'genre'='science fiction', 'genre'='fantasy', ...})
      }
    }
    next();
  }, 

    body('title', 'Book must have a title').trim().isLength({ min: 1}).escape(),
    body('summary', 'Book must have a summary').trim().isLength({ min: 1}).escape(),
    body('isbn', 'Book must have an isbn').trim().isLength({min: 1}).escape(),
    body('author_id', 'Book must have an author').trim().isLength({min: 1}).escape(),
    body('genre.*').escape(),

    //update database
    (req, res, next) => {
      //make temp book entry to return if some errors are present in forms
      //should really call this tempBook or something.  tempBook vs dbBook (one is saved in memory and other saved in database)
      let book = new Book({
        title: req.body.title,
        author: req.body.author_id,
        summary: req.body.summary,
        isbn: req.body.isbn,
        genre: req.body.genre,
        _id: req.params.id //need this otherwise new id will be assigned
      });

      //check validation results
      let errors = validationResult(req);

      if(!errors.isEmpty()) {
        async.parallel({
          authors: function(callback) {
            Author.find()
              .sort([['family_name', 'ascending']])
              .exec(callback);
          }, 
          genres: function(callback) {
            Genre.find()
              .sort([['name', 'ascending']])
              .exec(callback);
          }
        }, function(err, results) {
          if(err) { return next(err); }

          //need to fill in genre.check values here
          //looop through results.genre 
          //check if id of that genre exists in book.genre (check value of index.  If > -1, then in array, else not present)
          //compare genres in temp book entry with all genres
          for(let i = 0; i < results.genres.length; i++) {
            if(book.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked = 'true';
            }
          }

          res.render('book_form', { title: 'Edit Book', book: book, author_list: results.authors, genre_list: results.genres , errors: errors.array()});
        });
      }else{
        //findByIdAndUpdate  (look at example on how to do this)
        //find dbBook and replace with tempBook
        Book.findByIdAndUpdate(req.params.id, book, {}, function(err, thebook) {
          if(err) { return next(err); }
          res.redirect(thebook.url);
        });
      }
    }

];
