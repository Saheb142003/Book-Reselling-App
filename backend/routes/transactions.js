const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get transactions for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create a transaction (credit/debit)
// Note: In a real app, this route should be highly restricted (e.g. only internal logic or admin can call it)
router.post('/', auth, async (req, res) => {
  try {
    const { type, amount, description, relatedId } = req.body;
    
    // Create transaction record
    const newTx = new Transaction({
      userId: req.user.id,
      type,
      amount,
      description,
      relatedId
    });
    const transaction = await newTx.save();

    // Update user credits
    const user = await User.findById(req.user.id);
    if (type === 'credit') {
        user.credits += amount;
    } else {
        user.credits -= amount;
    }
    await user.save();

    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
