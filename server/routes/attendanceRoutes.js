const express = require('express');
const router = express.Router();
const { 
    checkIn, 
    checkOut, 
    getTodayStatus, 
    getAllAttendance, 
    getMyHistory,
    exportReport // <--- This was missing before!
} = require('../controllers/attendanceController');
const { protect, admin } = require('../middleware/authMiddleware');

// Employee Routes
router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/today', protect, getTodayStatus);
router.get('/my-history', protect, getMyHistory);

// Manager Routes
router.get('/all', protect, admin, getAllAttendance);
router.get('/export', protect, admin, exportReport); // <--- Added this route

module.exports = router;