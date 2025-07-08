
const express = require('express');
const router = express.Router();
const Due = require('../models/Due');
const Book = require('../models/Book');
const Member = require('../models/Member');
const Reservation = require('../models/Reservation');
const ActivityLog = require('../models/ActivityLog');

// @route   GET api/dues
// @desc    Get all dues
// @access  Public
router.get('/', async (req, res) => {
  try {
    const dues = await Due.find()
      .populate('memberId', 'name email')
      .populate('bookId', 'title author')
      .sort({ dueDate: 1 });
    res.json(dues);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/dues/member/:memberId
// @desc    Get dues by member ID
// @access  Public
router.get('/member/:memberId', async (req, res) => {
  try {
    const dues = await Due.find({ 
      memberId: req.params.memberId
    })
      .populate('bookId', 'title author isbn coverImage')
      .populate('memberId', 'name')
      .sort({ issueDate: -1 });
    
    res.json(dues);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/dues/:id
// @desc    Get due by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const due = await Due.findById(req.params.id)
      .populate('memberId', 'name email')
      .populate('bookId', 'title author');
    
    if (!due) {
      return res.status(404).json({ msg: 'Due record not found' });
    }
    
    res.json(due);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Due record not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/dues
// @desc    Create a new due record (issue a book)
// @access  Public
router.post('/', async (req, res) => {
  const { 
    memberId, 
    bookId, 
    issueDate, 
    dueDate, 
    returnDate, 
    fineAmount, 
    status 
  } = req.body;
  
  try {
    // Check if member exists
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ msg: 'Member not found' });
    }
    
    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }
    
    // Check if book has available copies
    if (book.availableCopies <= 0 && !returnDate) {
      return res.status(400).json({ msg: `No copies of this book are available` });
    }
    
    // Create new due record
    const due = new Due({
      memberId,
      bookId,
      issueDate: issueDate || Date.now(),
      dueDate,
      returnDate,
      fineAmount: fineAmount || 0,
      status: status || 'pending'
    });
    
    // Update book available copies if not being returned immediately
    if (!returnDate) {
      await Book.findByIdAndUpdate(bookId, { 
        $inc: { availableCopies: -1 } 
      });
      
      // If this was the last copy, update status
      const updatedBook = await Book.findById(bookId);
      if (updatedBook.availableCopies === 0) {
        await Book.findByIdAndUpdate(bookId, { 
          status: 'borrowed' 
        });
      }
      
      // Log the borrow activity
      const activityLog = new ActivityLog({
        userId: memberId,
        action: 'borrow',
        bookId,
        details: {
          dueDate,
          issueDate: due.issueDate
        }
      });
      
      await activityLog.save();
    }
    
    await due.save();
    
    // Populate member and book data for the response
    const populatedDue = await Due.findById(due._id)
      .populate('memberId', 'name email')
      .populate('bookId', 'title author');
    
    res.json(populatedDue);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/dues/:id
// @desc    Update a due record (return a book, update fine, etc.)
// @access  Public
router.put('/:id', async (req, res) => {
  const { 
    issueDate, 
    dueDate, 
    returnDate, 
    fineAmount, 
    status 
  } = req.body;
  
  try {
    let due = await Due.findById(req.params.id);
    
    if (!due) {
      return res.status(404).json({ msg: 'Due record not found' });
    }
    
    // Build due object with fields to update
    const dueFields = {};
    if (issueDate) dueFields.issueDate = issueDate;
    if (dueDate) dueFields.dueDate = dueDate;
    if (returnDate !== undefined) dueFields.returnDate = returnDate;
    if (fineAmount !== undefined) dueFields.fineAmount = fineAmount;
    if (status) dueFields.status = status;
    
    // If book is being returned and it wasn't before, update book copies
    if (returnDate && !due.returnDate) {
      const book = await Book.findById(due.bookId);
      
      await Book.findByIdAndUpdate(due.bookId, { 
        $inc: { availableCopies: 1 },
        status: 'available'
      });
      
      // Log the return activity
      const activityLog = new ActivityLog({
        userId: due.memberId,
        action: 'return',
        bookId: due.bookId,
        details: {
          returnDate,
          fineAmount,
          status
        }
      });
      
      await activityLog.save();
      
      // Check for pending reservations for this book
      const pendingReservation = await Reservation.findOne({
        bookId: due.bookId,
        status: 'pending'
      }).sort({ reservationDate: 1 });
      
      // If there's a pending reservation, mark it for notification
      if (pendingReservation) {
        await Reservation.findByIdAndUpdate(
          pendingReservation._id,
          { $set: { notificationSent: false } }
        );
      }
    }
    
    // If return date is being removed, update book copies again (book is being re-borrowed)
    if (returnDate === null && due.returnDate) {
      const book = await Book.findById(due.bookId);
      
      if (book.availableCopies <= 0) {
        return res.status(400).json({ msg: `No copies of this book are available` });
      }
      
      await Book.findByIdAndUpdate(due.bookId, { 
        $inc: { availableCopies: -1 } 
      });
      
      // If this was the last copy, update status
      const updatedBook = await Book.findById(due.bookId);
      if (updatedBook.availableCopies === 0) {
        await Book.findByIdAndUpdate(due.bookId, { 
          status: 'borrowed' 
        });
      }
    }
    
    due = await Due.findByIdAndUpdate(
      req.params.id,
      { $set: dueFields },
      { new: true }
    ).populate('memberId', 'name email')
      .populate('bookId', 'title author');
    
    res.json(due);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Due record not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/dues/:id
// @desc    Delete a due record
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const due = await Due.findById(req.params.id);
    
    if (!due) {
      return res.status(404).json({ msg: 'Due record not found' });
    }
    
    // If book was not returned yet, update its available copies
    if (!due.returnDate) {
      await Book.findByIdAndUpdate(due.bookId, { 
        $inc: { availableCopies: 1 } 
      });
      
      // Check if book was previously marked as borrowed
      const book = await Book.findById(due.bookId);
      if (book.status === 'borrowed') {
        await Book.findByIdAndUpdate(due.bookId, { 
          status: 'available' 
        });
      }
      
      // Check for pending reservations for this book
      const pendingReservation = await Reservation.findOne({
        bookId: due.bookId,
        status: 'pending'
      }).sort({ reservationDate: 1 });
      
      // If there's a pending reservation, mark it for notification
      if (pendingReservation) {
        await Reservation.findByIdAndUpdate(
          pendingReservation._id,
          { $set: { notificationSent: false } }
        );
      }
    }
    
    await Due.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'Due record removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Due record not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
