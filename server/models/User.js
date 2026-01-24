const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['employee', 'manager'], default: 'employee' },
    employeeId: { type: String, unique: true }, 
    department: { type: String, default: 'General' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);