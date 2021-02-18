const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { DateTime } = require('luxon');

const AuthorSchema = new Schema(
  {
    first_name: {type: String, required: true, maxLength: 100},
    family_name: {type: String, required: true, maxLength: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date}
  }
);

AuthorSchema
  .virtual('name')
  .get(function() {
    return this.family_name + ', ' + this.first_name;
  });

AuthorSchema
  .virtual('lifespan')
  .get(function() {
    let birthDate = this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED) : '';
    let deathDate = this.date_of_death ? DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED) : '';
    return birthDate + ' - ' + deathDate;
  });

AuthorSchema
  .virtual('url')
  .get(function() {
    return '/catalog/author/' + this._id;
  });


module.exports = mongoose.model('Author', AuthorSchema);
