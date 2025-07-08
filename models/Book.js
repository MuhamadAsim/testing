
const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  isbn: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  publishedYear: {
    type: Number,
    required: true
  },
  genre: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  totalCopies: {
    type: Number,
    required: true,
    default: 1
  },
  availableCopies: {
    type: Number,
    required: true,
    default: 1
  },
  status: {
    type: String,
    required: true,
    enum: ['available', 'borrowed', 'reserved', 'maintenance'],
    default: 'available'
  },
  coverImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=2070&auto=format&fit=crop'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update book status based on available copies
BookSchema.pre('save', function(next) {
  if (this.availableCopies === 0) {
    this.status = 'borrowed';
  } else if (this.availableCopies < this.totalCopies) {
    this.status = 'available';
  }
  next();
});

module.exports = mongoose.model('Book', BookSchema);
