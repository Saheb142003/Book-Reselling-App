const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
// Connect to MongoDB with automated local fallback
const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/book-exchange';
const sanitizeDatabase = async () => {
  try {
    const Exchange = require('./models/Exchange');
    const Book = require('./models/Book');
    const mongoose = require('mongoose');

    // Remove exchanges with malformed bookId or user IDs
    const exchanges = await Exchange.find({});
    let exchangeCleanCount = 0;
    for (const ex of exchanges) {
      const isBookIdValid = mongoose.Types.ObjectId.isValid(ex.bookId);
      const isRequesterIdValid = mongoose.Types.ObjectId.isValid(ex.requesterId);
      const isOwnerIdValid = mongoose.Types.ObjectId.isValid(ex.ownerId);

      const hasMalformedBookId = ex.bookId && ex.bookId.toString().includes('[object Object]');
      
      if (!isBookIdValid || !isRequesterIdValid || !isOwnerIdValid || hasMalformedBookId) {
        await Exchange.deleteOne({ _id: ex._id });
        exchangeCleanCount++;
      }
    }
    if (exchangeCleanCount > 0) {
      console.log(`🧹 Cleaned up ${exchangeCleanCount} corrupted exchange records.`);
    }

    // Remove books with malformed properties
    const books = await Book.find({});
    let bookCleanCount = 0;
    for (const book of books) {
      const hasMalformedId = book._id && book._id.toString().includes('[object Object]');
      if (hasMalformedId) {
        await Book.deleteOne({ _id: book._id });
        bookCleanCount++;
      }
    }
    if (bookCleanCount > 0) {
      console.log(`🧹 Cleaned up ${bookCleanCount} corrupted book records.`);
    }
  } catch (err) {
    console.error('⚠️ Database sanitization warning:', err.message);
  }
};

mongoose
  .connect(dbUri)
  .then(() => {
    console.log(`✅ MongoDB connected successfully to: ${dbUri.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB'}`);
    sanitizeDatabase();
  })
  .catch(async (err) => {
    console.warn(`⚠️ Primary MongoDB connection failed (${err.message}). trying fallback to local database...`);
    const localUri = 'mongodb://127.0.0.1:27017/book-exchange';
    if (dbUri !== localUri) {
      try {
        await mongoose.connect(localUri);
        console.log('✅ Fallback connected successfully to Local MongoDB (mongodb://127.0.0.1:27017/book-exchange)');
        sanitizeDatabase();
      } catch (localErr) {
        console.error('❌ Both MongoDB Atlas and Local MongoDB connections failed.');
        console.error('Local connection error:', localErr.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/exchanges', require('./routes/exchanges'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
