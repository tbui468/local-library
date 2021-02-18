const BookInstance = require('../models/bookinstance');

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
exports.bookinstance_create_get = function(req, res) {
  res.send('NOT IMPLEMENTED: Author list');
}
exports.bookinstance_create_post = function(req, res) {
  res.send('NOT IMPLEMENTED: Author list');
}
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
