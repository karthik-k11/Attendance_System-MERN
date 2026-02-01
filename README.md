# Employee Attendance Management System

A full-stack MERN application for tracking employee attendance, managing leave status, and generating reports.

## Tech Stack
- **Frontend:** React.js, Redux Toolkit, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Tools:** Axios, BCrypt, JWT, CSV-Writer

## Features

### Employee
- **Secure Login/Registration:** Role-based authentication.
- **Mark Attendance:** Real-time Check-In and Check-Out functionality.
- **Smart Logic:** System automatically detects "Late" arrivals (after 10:00 AM) and "Half Day" shifts (< 4 hours worked).
- **History:** View personal attendance history with status indicators.

###  Manager
- **Team Monitoring:** View attendance records for all employees.
- **Export Reports:** One-click download of attendance data as CSV for payroll/HR.
- **Real-time Status:** See who is present, absent, or late.

## Setup & Installation

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB (Installed locally or using MongoDB Atlas)

### 2. Installation Steps

**Backend Setup:**
```bash
cd server
npm install

# Create a .env file in the /server folder with the following:
# PORT=5000
# MONGO_URI=mongodb://127.0.0.1:27017/attendance_db
# JWT_SECRET=tapacademy_secret_key

# Start the Backend Server
npm run dev