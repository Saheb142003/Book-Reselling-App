const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('⚠️ Cloudinary environment variables are missing. File uploads will fall back to placeholders.');
}

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Image Upload Endpoint
router.post('/upload', auth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    // Fallback if Cloudinary is not configured
    console.warn('Cloudinary not configured. Returning placeholder.');
    return res.json({ url: 'https://placehold.co/400x600?text=No+Cover' });
  }

  const stream = cloudinary.uploader.upload_stream(
    { folder: 'book_reselling' },
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ message: 'Failed to upload image' });
      }
      res.json({ url: result.secure_url });
    }
  );

  stream.write(req.file.buffer);
  stream.end();
});

// Get all approved & available books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find({ status: 'available', approvalStatus: 'approved' }).populate('sellerId', 'displayName email photoURL');
    res.json(books);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get all books listed by the authenticated user
router.get('/user/me', auth, async (req, res) => {
  try {
    const books = await Book.find({ sellerId: req.user.id }).populate('sellerId', 'displayName email photoURL');
    res.json(books);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('sellerId', 'displayName email photoURL');
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Book not found' });
    res.status(500).send('Server Error');
  }
});

// Create a book
router.post('/', auth, async (req, res) => {
  try {
    const { resoldFromBookId, ...bookData } = req.body;

    const newBook = new Book({
      ...bookData,
      sellerId: req.user.id
    });
    const book = await newBook.save();

    // If it is resold from a purchased book, mark the original book as resold
    if (resoldFromBookId) {
      await Book.findByIdAndUpdate(resoldFromBookId, { $set: { status: 'resold' } });
    }

    // If the book is approved immediately (resold books), increment user listing count and award credits
    if (book.approvalStatus === 'approved') {
      const User = require('../models/User');
      const creditsToAward = Number(book.credits) || 0;
      await User.findByIdAndUpdate(req.user.id, { 
        $inc: { 
          booksListed: 1,
          credits: creditsToAward
        } 
      });
    }

    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update a book
router.put('/:id', auth, async (req, res) => {
  try {
    let book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Fetch user details to check if they are admin
    const User = require('../models/User');
    const caller = await User.findById(req.user.id);
    const isAdmin = caller && caller.role === 'admin';

    // Ensure user owns book or is admin
    if (book.sellerId.toString() !== req.user.id && !isAdmin) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Recalculate seller credits if the price/credits is edited
    if (req.body.credits !== undefined && Number(req.body.credits) !== book.credits) {
      const oldCredits = Number(book.credits) || 0;
      const newCredits = Number(req.body.credits) || 0;
      const diff = newCredits - oldCredits;

      console.log(`[Recalculate Credits] Book: "${book.title}" (${book._id})`);
      console.log(`[Recalculate Credits] oldPrice: ${oldCredits}, newPrice: ${newCredits}, diff: ${diff}`);

      // Only adjust credits if the book is approved
      if (book.approvalStatus === 'approved') {
        const seller = await User.findById(book.sellerId);
        if (seller) {
          const originalCredits = Number(seller.credits) || 0;
          seller.credits = originalCredits + diff;
          await seller.save();
          console.log(`[Recalculate Credits] Seller: ${seller.email}, originalCredits: ${originalCredits}, newCredits: ${seller.credits}`);
        }
      }
    }

    book = await Book.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete a book
router.delete('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (book.sellerId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await book.deleteOne();
    res.json({ message: 'Book removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
