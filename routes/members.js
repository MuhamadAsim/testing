const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const auth = require('../middleware/auth');

// @route   GET api/members
// @desc    Get all members
// @access  Public
router.get('/', async (req, res) => {
  try {
    const members = await Member.find().sort({ name: 1 });
    res.json(members);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/members/:id
// @desc    Get member by ID
// @access  Public
router.get('/:id', auth, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({ msg: 'Member not found' });
    }
    
    res.json(member);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Member not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/members
// @desc    Add a new member
// @access  Public
router.post('/', async (req, res) => {
  const { name, email, phone, address, membershipDate, status } = req.body;
  
  try {
    // Check if member with the email already exists
    let member = await Member.findOne({ email });
    
    if (member) {
      return res.status(400).json({ msg: 'Member with this email already exists' });
    }
    
    member = new Member({
      name,
      email,
      phone,
      address,
      membershipDate,
      status
    });
    
    await member.save();
    res.json(member);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/members/:id
// @desc    Update a member
// @access  Public
router.put('/:id', auth, async (req, res) => {
  const { name, email, phone, address, membershipDate, status } = req.body;
  
  // Build member object
  const memberFields = {};
  if (name) memberFields.name = name;
  if (email) memberFields.email = email;
  if (phone) memberFields.phone = phone;
  if (address) memberFields.address = address;
  if (membershipDate) memberFields.membershipDate = membershipDate;
  if (status) memberFields.status = status;
  
  try {
    let member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({ msg: 'Member not found' });
    }
    
    // Check if updating to an email that already exists
    if (email && email !== member.email) {
      const emailExists = await Member.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ msg: 'Email already in use by another member' });
      }
    }
    
    member = await Member.findByIdAndUpdate(
      req.params.id,
      { $set: memberFields },
      { new: true }
    );
    
    res.json(member);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Member not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/members/:id
// @desc    Delete a member
// @access  Public
router.delete('/:id', auth, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({ msg: 'Member not found' });
    }
    
    await Member.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'Member removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Member not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
