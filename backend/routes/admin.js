const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Book = require('../models/Book');
const Exchange = require('../models/Exchange');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Middleware to check admin role
const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        next();
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Get admin stats
router.get('/stats', [auth, isAdmin], async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalBooks = await Book.countDocuments();
        const totalExchanges = await Exchange.countDocuments();
        res.json({ totalUsers, totalBooks, totalExchanges });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get pending books
router.get('/pending-books', [auth, isAdmin], async (req, res) => {
    try {
        const books = await Book.find({ approvalStatus: 'pending' }).populate('sellerId', 'displayName email').sort({ createdAt: -1 });
        res.json(books);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Approve a book
router.post('/approve-book/:id', [auth, isAdmin], async (req, res) => {
    try {
        const { creditAmount } = req.body;
        const book = await Book.findById(req.params.id);
        
        if (!book) return res.status(404).json({ message: 'Book not found' });
        if (book.approvalStatus !== 'pending') return res.status(400).json({ message: 'Book is not pending' });

        book.approvalStatus = 'approved';
        book.credits = creditAmount || book.credits;
        await book.save();

        const user = await User.findById(book.sellerId);
        if (user) {
            // Note: Giving credits immediately upon approval might not be desired if it's a marketplace, 
            // but the original logic `newCredits = user.credits + creditAmount` did this.
            user.credits += (creditAmount || book.credits);
            user.booksListed = (user.booksListed || 0) + 1;
            await user.save();
        }

        res.json({ message: 'Book approved', book });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Reject a book
router.post('/reject-book/:id', [auth, isAdmin], async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        
        book.approvalStatus = 'rejected';
        await book.save();

        res.json({ message: 'Book rejected', book });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get transaction history (all accepted exchanges)
router.get('/transactions', [auth, isAdmin], async (req, res) => {
    try {
        const transactions = await Exchange.find({ status: 'accepted' })
            .populate('bookId')
            .populate('requesterId', 'displayName email')
            .populate('ownerId', 'displayName email')
            .sort({ updatedAt: -1 });
        
        res.json(transactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
