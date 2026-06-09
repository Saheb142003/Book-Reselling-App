const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isbn: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  authors: [{
    type: String,
  }],
  description: {
    type: String,
    required: true,
  },
  minPrice: {
    type: Number,
    required: true,
  },
  credits: {
    type: Number,
    required: true,
  },
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
    required: true,
  },
  genre: String,
  coverUrl: {
    type: String,
    required: true,
  },
  publishedDate: String,
  status: {
    type: String,
    enum: ['available', 'sold', 'resold'],
    default: 'available',
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending', // Admins will approve it
  }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
