const mongoose = require('mongoose');

const exchangeSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  bookTitle: {
    type: String,
    required: true,
  },
  bookCoverUrl: {
    type: String,
    required: true,
  },
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requesterName: {
    type: String,
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['requested', 'accepted', 'rejected', 'cancelled'],
    default: 'requested',
  },
  creditsCost: {
    type: Number,
    required: true,
  },
  buyerFee: {
    type: Number,
    default: 0,
  },
  sellerFee: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model('Exchange', exchangeSchema);
