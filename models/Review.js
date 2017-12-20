const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const reviewSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now,
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You must supply an author',
  },
  text: {
    type: String,
    required: 'Your review must have text',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
    required: 'You must supply a store!',
  },
});


module.exports = mongoose.model('Review', reviewSchema);
