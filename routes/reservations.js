const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Book = require('../models/Book');
const Member = require('../models/Member');
const ActivityLog = require('../models/ActivityLog');

// @route   GET api/reservations
// @desc    Get all reservations
// @access  Public
router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('memberId', 'name email')
      .populate('bookId', 'title author')
      .sort({ reservationDate: -1 });
    res.json(reservations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/reservations/:id
// @desc    Get reservation by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('memberId', 'name email')
      .populate('bookId', 'title author');
    
    if (!reservation) {
      return res.status(404).json({ msg: 'Reservation not found' });
    }
    
    res.json(reservation);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Reservation not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/reservations
// @desc    Create a new reservation
// @access  Public
router.post('/', async (req, res) => {
  const { memberId, bookId } = req.body;
  
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

    // Check if the member already has a pending reservation for this book
    const existingReservation = await Reservation.findOne({
      memberId,
      bookId,
      status: 'pending'
    });
    
    if (existingReservation) {
      return res.status(400).json({ msg: 'Member already has a pending reservation for this book' });
    }
    
    // Create a new reservation
    const reservation = new Reservation({
      memberId,
      bookId
    });
    
    await reservation.save();
    
    // Log the reservation activity
    const activityLog = new ActivityLog({
      userId: memberId,
      action: 'reserve',
      bookId,
      details: {
        reservationDate: reservation.reservationDate
      }
    });
    
    await activityLog.save();
    
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

// @route   PUT api/reservations/:id
// @desc    Update a reservation
// @access  Public
router.put('/:id', async (req, res) => {
  const { status, notificationSent } = req.body;
  
  try {
    let reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ msg: 'Reservation not found' });
    }
    
    // Build reservation object
    const reservationFields = {};
    if (status) reservationFields.status = status;
    if (notificationSent !== undefined) reservationFields.notificationSent = notificationSent;
    
    // If status is changing, log the activity
    if (status && status !== reservation.status) {
      const action = status === 'fulfilled' ? 'reservation_fulfilled' : 
                    status === 'cancelled' ? 'cancel_reservation' : null;
      
      if (action) {
        const activityLog = new ActivityLog({
          userId: reservation.memberId,
          action,
          bookId: reservation.bookId,
          details: {
            previousStatus: reservation.status,
            newStatus: status
          }
        });
        
        await activityLog.save();
      }
    }
    
    reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { $set: reservationFields },
      { new: true }
    ).populate('memberId', 'name email')
      .populate('bookId', 'title author');
    
    res.json(reservation);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Reservation not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/reservations/:id
// @desc    Delete a reservation
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ msg: 'Reservation not found' });
    }
    
    await Reservation.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'Reservation removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Reservation not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/reservations/member/:memberId
// @desc    Get all reservations for a member
// @access  Public
router.get('/member/:memberId', async (req, res) => {
  try {
    const reservations = await Reservation.find({ memberId: req.params.memberId })
      .populate('bookId', 'title author')
      .sort({ reservationDate: -1 });
    
    res.json(reservations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/reservations/book/:bookId
// @desc    Get all reservations for a book
// @access  Public
router.get('/book/:bookId', async (req, res) => {
  try {
    const reservations = await Reservation.find({ 
      bookId: req.params.bookId,
      status: 'pending'
    })
      .populate('memberId', 'name email')
      .sort({ reservationDate: 1 });
    
    res.json(reservations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
