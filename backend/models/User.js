const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    default: null,
  },
  photoURL: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  credits: {
    type: Number,
    default: 0,
  },
  booksListed: {
    type: Number,
    default: 0,
  },
  booksSold: {
    type: Number,
    default: 0,
  },
  bio: String,
  location: String,
  phoneNumber: String,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
