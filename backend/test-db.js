const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../../../backend/.env' });

const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/book-exchange';

mongoose.connect(dbUri)
  .then(async () => {
    console.log("Connected to MongoDB:", dbUri);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    // Find all users
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log(`Total Users: ${users.length}`);
    users.forEach(u => {
      console.log(`User: ${u.email}, ID: ${u._id}, Credits: ${u.credits}, booksListed: ${u.booksListed}, role: ${u.role}`);
    });

    // Find all books
    const books = await mongoose.connection.db.collection('books').find({}).toArray();
    console.log(`Total Books: ${books.length}`);
    books.forEach(b => {
      console.log(`Book: "${b.title}", SellerId: ${b.sellerId}, ApprovalStatus: ${b.approvalStatus}, Status: ${b.status}`);
    });

    mongoose.connection.close();
  })
  .catch(err => {
    console.error(err);
  });
