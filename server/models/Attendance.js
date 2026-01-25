const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    status: { 
        type: String, 
        enum: ['Present', 'Absent', 'Late', 'Half Day'], 
        default: 'Absent' 
    },
    totalHours: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);