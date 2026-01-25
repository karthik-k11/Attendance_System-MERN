const Attendance = require('../models/Attendance');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');

// Helper to get today's date (YYYY-MM-DD)
const getTodayDate = () => new Date().toISOString().split('T')[0];

// @desc    Check In
// @route   POST /api/attendance/checkin
const checkIn = async (req, res) => {
    const userId = req.user.id;
    const date = getTodayDate();

    const existingAttendance = await Attendance.findOne({ userId, date });
    if (existingAttendance) {
        return res.status(400).json({ message: 'Already checked in today' });
    }

    // Logic for "Late" (After 10:00 AM)
    const now = new Date();
    const limit = new Date();
    limit.setHours(10, 0, 0, 0); // 10:00 AM
    
    const status = now > limit ? 'Late' : 'Present';

    const attendance = await Attendance.create({
        userId,
        date,
        checkInTime: now,
        status,
        totalHours: 0
    });

    res.status(200).json(attendance);
};

// @desc    Check Out
// @route   POST /api/attendance/checkout
const checkOut = async (req, res) => {
    const userId = req.user.id;
    const date = getTodayDate();

    const attendance = await Attendance.findOne({ userId, date });

    if (!attendance) {
        return res.status(400).json({ message: 'You have not checked in today' });
    }

    const checkOutTime = new Date();
    attendance.checkOutTime = checkOutTime;

    // Calculate Hours
    const diffMs = checkOutTime - new Date(attendance.checkInTime);
    const diffHrs = diffMs / (1000 * 60 * 60);
    attendance.totalHours = diffHrs.toFixed(2);

    // Logic for "Half Day" (Less than 4 hours)
    if (diffHrs < 4) {
        attendance.status = 'Half Day';
    }

    await attendance.save();

    res.status(200).json(attendance);
};

// @desc    Get today's status
// @route   GET /api/attendance/today
const getTodayStatus = async (req, res) => {
    const userId = req.user.id;
    const date = getTodayDate();
    const attendance = await Attendance.findOne({ userId, date });
    
    if(!attendance) return res.json(null);
    res.json(attendance);
};

// @desc    Get all attendance (Manager)
// @route   GET /api/attendance/all
const getAllAttendance = async (req, res) => {
    const attendance = await Attendance.find({})
        .populate('userId', 'name email employeeId department')
        .sort({ date: -1 });
    res.json(attendance);
};

// @desc    Get my history
// @route   GET /api/attendance/my-history
const getMyHistory = async (req, res) => {
    const history = await Attendance.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(history);
};

// @desc    Manager: Export Report (THIS WAS MISSING)
// @route   GET /api/attendance/export
const exportReport = async (req, res) => {
    try {
        const records = await Attendance.find({}).populate('userId', 'name employeeId');
        
        // Define CSV path
        const filePath = path.join(__dirname, '..', 'reports', 'attendance.csv');
        
        const csvWriter = createCsvWriter({
            path: filePath,
            header: [
                {id: 'name', title: 'Name'},
                {id: 'empId', title: 'Employee ID'},
                {id: 'date', title: 'Date'},
                {id: 'status', title: 'Status'},
                {id: 'hours', title: 'Total Hours'}
            ]
        });
    
        const data = records.map(record => ({
            name: record.userId ? record.userId.name : 'Unknown',
            empId: record.userId ? record.userId.employeeId : 'N/A',
            date: record.date,
            status: record.status,
            hours: record.totalHours
        }));
    
        await csvWriter.writeRecords(data);
        res.download(filePath);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Export failed' });
    }
};

module.exports = {
    checkIn,
    checkOut,
    getTodayStatus,
    getAllAttendance,
    getMyHistory,
    exportReport
};