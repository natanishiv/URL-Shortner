const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    originalUrl: {
      type: String,
      required: true
    },
    note: {
      type: String,
      required: true
    },
    shortenedUrl: {
      type: String,
      required: true
    }
  });

const Url = mongoose.model('Url', urlSchema);

module.exports = Url;