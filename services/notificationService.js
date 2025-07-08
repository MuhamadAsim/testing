
const Reservation = require('../models/Reservation');
const Member = require('../models/Member');
const Book = require('../models/Book');
const Notification = require('../models/Notification');
const Due = require('../models/Due');
const User = require('../models/User');

// This would be set up with actual email credentials
const emailConfig = {
  username: "",  // To be provided by user
  password: "",  // To be provided by user
  serviceId: ""  // To be provided by user
};

// Function to create a notification in the database
const createNotification = async (userId, type, title, message) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      date: new Date(),
      read: false
    });
    
    await notification.save();
    console.log(`Notification created for user ${userId}`);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Function to check for pending notifications
const checkPendingNotifications = async () => {
  try {
    // Find reservations that need notification
    const pendingNotifications = await Reservation.find({
      status: 'pending',
      notificationSent: false
    })
      .populate('memberId', 'name email')
      .populate('bookId', 'title author');
    
    console.log(`Found ${pendingNotifications.length} pending notifications`);
    
    for (const reservation of pendingNotifications) {
      // Check if the book is actually available
      const book = await Book.findById(reservation.bookId);
      
      if (book && book.availableCopies > 0) {
        // Book is available, send notification
        await sendBookAvailableNotification(
          reservation.memberId.email,
          reservation.memberId.name,
          book.title,
          book.author
        );
        
        // Find the user associated with this member
        const user = await User.findOne({ memberId: reservation.memberId._id });
        
        if (user) {
          // Create a notification in the database
          await createNotification(
            user._id,
            'reservation',
            'Book Ready for Pickup',
            `Your reserved book '${book.title}' by ${book.author} is now available for pickup. Please visit the library within 48 hours to check out this book.`
          );
        }
        
        // Mark notification as sent
        await Reservation.findByIdAndUpdate(
          reservation._id,
          { notificationSent: true }
        );
        
        console.log(`Notification sent for reservation ${reservation._id}`);
      }
    }
    
    // Check for upcoming due dates (3 days before)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const upcomingDues = await Due.find({
      returnDate: null,
      dueDate: {
        $gte: new Date(),
        $lte: threeDaysFromNow
      }
    }).populate('memberId').populate('bookId');
    
    for (const due of upcomingDues) {
      // Find the user associated with this member
      const user = await User.findOne({ memberId: due.memberId._id });
      
      if (user) {
        // Create a notification for upcoming due
        await createNotification(
          user._id,
          'due',
          'Book Due Soon',
          `Your book '${due.bookId.title}' is due on ${new Date(due.dueDate).toLocaleDateString()}. Please return it on time to avoid late fees.`
        );
      }
    }
    
    // Check for overdue books
    const overdueDues = await Due.find({
      returnDate: null,
      dueDate: { $lt: new Date() }
    }).populate('memberId').populate('bookId');
    
    for (const due of overdueDues) {
      // Find the user associated with this member
      const user = await User.findOne({ memberId: due.memberId._id });
      
      if (user) {
        // Create a notification for overdue book
        await createNotification(
          user._id,
          'overdue',
          'Book Overdue Notice',
          `Your book '${due.bookId.title}' was due on ${new Date(due.dueDate).toLocaleDateString()}. Please return it as soon as possible to avoid additional fees.`
        );
      }
    }
  } catch (error) {
    console.error('Error checking pending notifications:', error);
  }
};

// Function to send notification email
const sendBookAvailableNotification = async (email, memberName, bookTitle, authorName) => {
  try {
    // Here we would use EmailJS or another email service to send the email
    console.log(`Sending email notification to ${email}`);
    console.log(`Dear ${memberName}, the book "${bookTitle}" by ${authorName} is now available.`);
    console.log(`Please visit the library within 48 hours to check out this book.`);
    
    // In a real implementation, we would use actual email sending here
    // EmailJS or nodemailer would be implemented here
    
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

// Function to start the notification service
const startNotificationService = (interval = 15 * 60 * 1000) => {  // Default: check every 15 minutes
  console.log(`Starting notification service with interval: ${interval}ms`);
  
  // Check immediately on startup
  checkPendingNotifications();
  
  // Then check at the specified interval
  return setInterval(checkPendingNotifications, interval);
};

module.exports = {
  startNotificationService,
  sendBookAvailableNotification,
  checkPendingNotifications,
  createNotification
};
