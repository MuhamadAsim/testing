
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    required: true,
    default: 'member'
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: function() {
      return this.role === 'member';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Simple password comparison without encryption
UserSchema.methods.comparePassword = function(candidatePassword) {
  console.log('Comparing password for user:', this.email);
  console.log('Stored password:', this.password);
  console.log('Candidate password:', candidatePassword);
  
  // Direct string comparison
  const isMatch = this.password === candidatePassword;
  console.log('Password match result:', isMatch);
  return isMatch;
};

module.exports = mongoose.model('User', UserSchema);
