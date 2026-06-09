const express = require('express');
const router = express.Router();
const Exchange = require('../models/Exchange');
const auth = require('../middleware/auth');

// Get exchanges for logged in user (as requester or owner)
router.get('/', auth, async (req, res) => {
  try {
    const exchanges = await Exchange.find({
      $or: [
        { requesterId: req.user.id },
        { ownerId: req.user.id }
      ]
    }).populate('bookId', 'status').sort({ createdAt: -1 });
    res.json(exchanges);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create a new exchange request
router.post('/', auth, async (req, res) => {
  try {
    const newExchange = new Exchange({
      ...req.body,
      requesterId: req.user.id
    });
    const exchange = await newExchange.save();
    res.json(exchange);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update exchange status (accept, reject, cancel)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    let exchange = await Exchange.findById(req.params.id);
    
    if (!exchange) return res.status(404).json({ message: 'Exchange not found' });

    // Verify user is either owner (can accept/reject) or requester (can cancel)
    const isOwner = exchange.ownerId.toString() === req.user.id;
    const isRequester = exchange.requesterId.toString() === req.user.id;

    if (!isOwner && !isRequester) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    if (isRequester && status !== 'cancelled') {
        return res.status(401).json({ message: 'Requester can only cancel' });
    }
    
    if (isOwner && (status === 'cancelled')) {
        return res.status(401).json({ message: 'Owner cannot cancel, only accept or reject' });
    }

    if (status === 'accepted') {
        const Book = require('../models/Book');
        const User = require('../models/User');
        const Transaction = require('../models/Transaction');

        const book = await Book.findById(exchange.bookId);
        const buyer = await User.findById(exchange.requesterId);
        const seller = await User.findById(exchange.ownerId);

        if (!book || book.status !== 'available') {
            exchange.status = 'cancelled';
            await exchange.save();
            return res.status(400).json({ message: 'Book is no longer available.' });
        }

        const basePrice = exchange.creditsCost;
        const buyerFee = Math.floor(basePrice * 0.05);
        const sellerFee = Math.floor(basePrice * 0.05);
        const totalBuyerCost = basePrice + buyerFee;
        const sellerReceives = basePrice - sellerFee;

        exchange.buyerFee = buyerFee;
        exchange.sellerFee = sellerFee;

        if (buyer.credits < totalBuyerCost) {
            return res.status(400).json({ message: 'Buyer has insufficient credits.' });
        }

        buyer.credits -= totalBuyerCost;
        seller.credits += sellerReceives;
        
        await buyer.save();
        await seller.save();

        book.status = 'sold';
        await book.save();

        const tx = new Transaction({
            userId: buyer._id,
            type: 'debit',
            amount: totalBuyerCost,
            description: `Purchased book: ${book.title}`,
            relatedId: exchange._id
        });
        await tx.save();

        const txSeller = new Transaction({
            userId: seller._id,
            type: 'credit',
            amount: sellerReceives,
            description: `Sold book: ${book.title}`,
            relatedId: exchange._id
        });
        await txSeller.save();
    }

    exchange.status = status;
    await exchange.save();
    
    res.json(exchange);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
