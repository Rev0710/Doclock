const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    getMe, 
    bookAppointment, 
    getMyAppointments,
    updateAppointment,
    deleteAppointment 
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// Auth
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Appointments CRUD
router.post('/book-appointment', protect, bookAppointment);
router.get('/my-appointments', protect, getMyAppointments);
router.put('/update-appointment/:id', protect, updateAppointment);
router.delete('/delete-appointment/:id', protect, deleteAppointment);

module.exports = router;