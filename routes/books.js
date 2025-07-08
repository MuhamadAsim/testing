
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Due = require('../models/Due');
const Reservation = require('../models/Reservation');

// @route   GET api/books
// @desc    Get all books
// @access  Public
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ title: 1 });
    res.json(books);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/books/:id
// @desc    Get book by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }
    
    res.json(book);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/books
// @desc    Add a new book
// @access  Public
router.post('/', async (req, res) => {
  const { 
    title, 
    author, 
    isbn, 
    publishedYear, 
    genre, 
    description, 
    status,
    totalCopies,
    availableCopies, 
    coverImage 
  } = req.body;
  
  try {
    // Check if book with the ISBN already exists
    let book = await Book.findOne({ isbn });
    
    if (book) {
      return res.status(400).json({ msg: 'Book with this ISBN already exists' });
    }
    
    book = new Book({
      title,
      author,
      isbn,
      publishedYear,
      genre,
      description,
      status,
      totalCopies: totalCopies || 1,
      availableCopies: availableCopies || totalCopies || 1,
      coverImage
    });
    
    await book.save();
    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/books/:id
// @desc    Update a book
// @access  Public
router.put('/:id', async (req, res) => {
  const { 
    title, 
    author, 
    isbn, 
    publishedYear, 
    genre, 
    description, 
    status, 
    totalCopies,
    availableCopies,
    coverImage 
  } = req.body;
  
  // Build book object
  const bookFields = {};
  if (title) bookFields.title = title;
  if (author) bookFields.author = author;
  if (isbn) bookFields.isbn = isbn;
  if (publishedYear) bookFields.publishedYear = publishedYear;
  if (genre) bookFields.genre = genre;
  if (description) bookFields.description = description;
  if (status) bookFields.status = status;
  if (totalCopies) bookFields.totalCopies = totalCopies;
  if (availableCopies !== undefined) bookFields.availableCopies = availableCopies;
  if (coverImage) bookFields.coverImage = coverImage;
  
  try {
    let book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }
    
    // Check if updating to an ISBN that already exists
    if (isbn && isbn !== book.isbn) {
      const isbnExists = await Book.findOne({ isbn });
      if (isbnExists) {
        return res.status(400).json({ msg: 'ISBN already in use by another book' });
      }
    }
    
    book = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: bookFields },
      { new: true }
    );
    
    // Check for pending reservations if copies become available
    if (bookFields.availableCopies > 0 && book.availableCopies > 0) {
      const pendingReservations = await Reservation.find({
        bookId: book._id,
        status: 'pending'
      }).populate('memberId', 'name email')
        .sort({ reservationDate: 1 })
        .limit(book.availableCopies);
      
      // Mark these reservations for notification
      for (const reservation of pendingReservations) {
        await Reservation.findByIdAndUpdate(
          reservation._id,
          { $set: { notificationSent: false } }
        );
      }
    }
    
    res.json(book);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/books/:id
// @desc    Delete a book
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }
    
    // Check if there are any active dues for this book
    const activeDues = await Due.find({ 
      bookId: req.params.id,
      returnDate: null
    });
    
    if (activeDues.length > 0) {
      return res.status(400).json({ 
        msg: 'Cannot delete book with active loans. Please return all copies first.' 
      });
    }
    
    // Delete all reservations for this book
    await Reservation.deleteMany({ bookId: req.params.id });
    
    await Book.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'Book removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Book not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/books/:id/reserve
// @desc    Reserve a book
// @access  Public
router.post('/:id/reserve', async (req, res) => {
  const { memberId } = req.body;
  
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }
    
    const member = await Member.findById(memberId);
    
    if (!member) {
      return res.status(404).json({ msg: 'Member not found' });
    }
    
    // Check if the member already has a pending reservation for this book
    const existingReservation = await Reservation.findOne({
      memberId,
      bookId: req.params.id,
      status: 'pending'
    });
    
    if (existingReservation) {
      return res.status(400).json({ msg: 'Member already has a pending reservation for this book' });
    }
    
    // If book is available, no need to reserve
    if (book.availableCopies > 0) {
      return res.status(400).json({ 
        msg: 'Book is currently available, no need to reserve',
        availableCopies: book.availableCopies
      });
    }
    
    // Create a new reservation
    const reservation = new Reservation({
      memberId,
      bookId: req.params.id
    });
    
    await reservation.save();
    
    // Populate the response
    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('memberId', 'name email')
      .populate('bookId', 'title author');
    
    res.json(populatedReservation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
