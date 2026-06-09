export const BOOK_CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
export const BOOK_GENRES = [
    'Fiction', 'Non-Fiction', 'Sci-Fi', 'Mystery', 
    'Romance', 'Thriller', 'Fantasy', 'Biography', 
    'History', 'Self-Help', 'Textbook', 'Other'
];
export const BOOK_STATUS = ['available', 'sold'];
export const APPROVAL_STATUS = ['pending', 'approved', 'rejected'];

export const initialBookState = {
    isbn: '',
    title: '',
    authors: [],
    description: '',
    minPrice: 0,
    credits: 0,
    condition: 'Good',
    genre: 'Fiction',
    coverUrl: '',
    status: 'available',
    approvalStatus: 'pending'
};
