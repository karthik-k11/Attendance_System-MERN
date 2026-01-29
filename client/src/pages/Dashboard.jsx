import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { logout } from '../redux/authSlice';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

const Dashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [attendance, setAttendance] = useState([]);
  const [todayStatus, setTodayStatus] = useState(null);
  
  const [filters, setFilters] = useState({
    name: '',
    employeeId: '',
    department: '',
    date: '',
    status: ''
  });

  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      fetchData();
    }
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      if (user.role === 'employee') {
        const todayRes = await axios.get('http://localhost:5000/api/attendance/today', config);
        setTodayStatus(todayRes.data);
        const historyRes = await axios.get('http://localhost:5000/api/attendance/my-history', config);
        setAttendance(historyRes.data);
      } else {
        const allRes = await axios.get('http://localhost:5000/api/attendance/all', config);
        setAttendance(allRes.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleCheckIn = async () => {
    try {
      await axios.post('http://localhost:5000/api/attendance/checkin', {}, config);
      alert('Checked In Successfully!');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error checking in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await axios.post('http://localhost:5000/api/attendance/checkout', {}, config);
      alert('Checked Out Successfully!');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error checking out');
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/attendance/export', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
      alert('Failed to download report');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // --- STATS LOGIC ---
  const getEmployeeStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth(); 
    const currentYear = now.getFullYear();

    const thisMonthRecords = attendance.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });

    const present = thisMonthRecords.filter(r => r.status === 'Present').length;
    const late = thisMonthRecords.filter(r => r.status === 'Late').length;
    const halfDay = thisMonthRecords.filter(r => r.status === 'Half Day').length;
    const totalHours = thisMonthRecords.reduce((acc, curr) => acc + (parseFloat(curr.totalHours) || 0), 0);

    return { present, late, halfDay, totalHours: totalHours.toFixed(2) };
  };

  const getManagerStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendance.filter(r => r.date === today);

    const present = todayRecords.filter(r => r.status === 'Present').length;
    const late = todayRecords.filter(r => r.status === 'Late').length;
    const halfDay = todayRecords.filter(r => r.status === 'Half Day').length;
    const absent = todayRecords.filter(r => r.status === 'Absent').length;

    return { present, late, halfDay, absent, totalMarked: todayRecords.length };
  };

  // --- CHART DATA GENERATORS ---

  // 1. Employee: Daily Hours Worked (Last 7 Days)
  const getEmpWeeklyHours = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const record = attendance.find(r => r.date === date);
      return { date, hours: record ? parseFloat(record.totalHours) : 0 };
    });
  };

  // 2. Employee: Monthly Status Distribution
  const getEmpStatusDistribution = () => {
    const stats = getEmployeeStats();
    return [
      { name: 'Present', value: stats.present },
      { name: 'Late', value: stats.late },
      { name: 'Half Day', value: stats.halfDay },
    ].filter(item => item.value > 0); // Only show statuses that exist
  };

  // 3. Manager: Weekly Trend
  const getMgrWeeklyTrend = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const count = attendance.filter(r => r.date === date && (r.status === 'Present' || r.status === 'Late')).length;
      return { date, Present: count };
    });
  };

  // 4. Manager: Dept Distribution
  const getMgrDeptData = () => {
    const deptCounts = {};
    attendance.forEach(record => {
      const dept = record.userId?.department || 'Unknown';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });
    return Object.keys(deptCounts).map(dept => ({ name: dept, value: deptCounts[dept] }));
  };

  const COLORS = ['#0088FE', '#FFBB28', '#FF8042', '#00C49F'];

  const empStats = getEmployeeStats();
  const mgrStats = getManagerStats();
  
  // Data for Charts
  const empHoursData = getEmpWeeklyHours();
  const empPieData = getEmpStatusDistribution();
  const mgrTrendData = getMgrWeeklyTrend();
  const mgrDeptData = getMgrDeptData();

  // Manager Filters
  const filteredAttendance = attendance.filter((record) => {
    if (user?.role === 'employee') return true;
    const matchesName = record.userId?.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchesId = record.userId?.employeeId.toLowerCase().includes(filters.employeeId.toLowerCase());
    const matchesDept = (record.userId?.department || '').toLowerCase().includes(filters.department.toLowerCase());
    const matchesDate = filters.date ? record.date === filters.date : true;
    const matchesStatus = filters.status ? record.status === filters.status : true;
    return matchesName && matchesId && matchesDept && matchesDate && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">Tap Academy Attendance</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, {user?.name} ({user?.role})</span>
          <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">Logout</button>
        </div>
      </nav>

      <div className="p-8 max-w-6xl mx-auto">
        
        {/* EMPLOYEE VIEW */}
        {user?.role === 'employee' && (
          <div className="space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded shadow text-center border-l-4 border-green-500">
                <h3 className="text-gray-500 text-sm font-bold">Present (Month)</h3>
                <p className="text-2xl font-bold text-green-600">{empStats.present}</p>
              </div>
              <div className="bg-white p-4 rounded shadow text-center border-l-4 border-yellow-500">
                <h3 className="text-gray-500 text-sm font-bold">Late (Month)</h3>
                <p className="text-2xl font-bold text-yellow-600">{empStats.late}</p>
              </div>
              <div className="bg-white p-4 rounded shadow text-center border-l-4 border-orange-500">
                <h3 className="text-gray-500 text-sm font-bold">Half Days</h3>
                <p className="text-2xl font-bold text-orange-600">{empStats.halfDay}</p>
              </div>
              <div className="bg-white p-4 rounded shadow text-center border-l-4 border-blue-500">
                <h3 className="text-gray-500 text-sm font-bold">Total Hours</h3>
                <p className="text-2xl font-bold text-blue-600">{empStats.totalHours}</p>
              </div>
            </div>

            {/* NEW: EMPLOYEE CHARTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Daily Hours Bar Chart */}
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-bold mb-4 text-center">My Hours Worked (Last 7 Days)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={empHoursData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={12} tickFormatter={(tick) => tick.slice(5)} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="hours" fill="#4F46E5" name="Hours" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Status Pie Chart */}
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-bold mb-4 text-center">My Attendance Breakdown</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={empPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {empPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Mark Attendance</h2>
                <div className="flex gap-4">
                  <button 
                    onClick={handleCheckIn}
                    disabled={todayStatus} 
                    className={`flex-1 py-3 rounded text-white font-bold ${todayStatus ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                  >
                    {todayStatus ? 'Checked In' : 'Check In'}
                  </button>
                  <button 
                    onClick={handleCheckOut}
                    disabled={!todayStatus || todayStatus.checkOutTime}
                    className={`flex-1 py-3 rounded text-white font-bold ${!todayStatus || todayStatus.checkOutTime ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
                  >
                    {todayStatus?.checkOutTime ? 'Day Completed' : 'Check Out'}
                  </button>
                </div>
                <div className="mt-4 text-center text-gray-600">
                  <p>Date: {new Date().toLocaleDateString()}</p>
                  <p>Status: <span className="font-bold text-blue-600">{todayStatus ? todayStatus.status : 'Not Marked'}</span></p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Recent History</h2>
                <ul className="space-y-2">
                  {attendance.slice(0, 5).map((record) => (
                    <li key={record._id} className="flex justify-between border-b pb-2">
                      <span>{record.date}</span>
                      <span className={`px-2 rounded text-sm ${record.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {record.status} ({record.totalHours} hrs)
                      </span>
                    </li>
                  ))}
                  {attendance.length === 0 && <p className="text-gray-500">No records found.</p>}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* MANAGER VIEW */}
        {user?.role === 'manager' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Manager Stats Cards... (Same as before) */}
              <div className="bg-white p-4 rounded shadow text-center border-l-4 border-blue-500">
                <h3 className="text-gray-500 text-sm font-bold">Total Marked Today</h3>
                <p className="text-2xl font-bold text-blue-600">{mgrStats.totalMarked}</p>
              </div>
              <div className="bg-white p-4 rounded shadow text-center border-l-4 border-green-500">
                <h3 className="text-gray-500 text-sm font-bold">Present Today</h3>
                <p className="text-2xl font-bold text-green-600">{mgrStats.present}</p>
              </div>
              <div className="bg-white p-4 rounded shadow text-center border-l-4 border-yellow-500">
                <h3 className="text-gray-500 text-sm font-bold">Late Today</h3>
                <p className="text-2xl font-bold text-yellow-600">{mgrStats.late}</p>
              </div>
              <div className="bg-white p-4 rounded shadow text-center border-l-4 border-red-500">
                <h3 className="text-gray-500 text-sm font-bold">Absent/Half Day</h3>
                <p className="text-2xl font-bold text-red-600">{mgrStats.absent + mgrStats.halfDay}</p>
              </div>
            </div>

            {/* MANAGER CHARTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-bold mb-4 text-center">Weekly Attendance Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mgrTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={12} tickFormatter={(tick) => tick.slice(5)} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Present" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-lg font-bold mb-4 text-center">Attendance by Department</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mgrDeptData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {mgrDeptData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Manager Filters and Table... (Same as before) */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold">Attendance Records</h2>
                <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-bold">
                  Download Report (CSV)
                </button>
              </div>

              <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-4 rounded border">
                <input type="text" placeholder="Name..." className="p-2 border rounded w-full md:w-1/6" value={filters.name} onChange={(e) => setFilters({...filters, name: e.target.value})} />
                <input type="text" placeholder="Dept (IT, Sales)..." className="p-2 border rounded w-full md:w-1/6" value={filters.department} onChange={(e) => setFilters({...filters, department: e.target.value})} />
                <input type="text" placeholder="Emp ID..." className="p-2 border rounded w-full md:w-1/6" value={filters.employeeId} onChange={(e) => setFilters({...filters, employeeId: e.target.value})} />
                <input type="date" className="p-2 border rounded" value={filters.date} onChange={(e) => setFilters({...filters, date: e.target.value})} />
                <select className="p-2 border rounded" value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                  <option value="">All Status</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                </select>
                {(filters.name || filters.department || filters.employeeId || filters.date || filters.status) && (
                  <button onClick={() => setFilters({ name: '', department: '', employeeId: '', date: '', status: '' })} className="text-red-500 text-sm hover:underline">Clear Filters</button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-3">Employee</th>
                      <th className="p-3">Dept</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Check In</th>
                      <th className="p-3">Check Out</th>
                      <th className="p-3">Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendance.map((record) => (
                      <tr key={record._id} className="border-b hover:bg-gray-50">
                        <td className="p-3"><div className="font-bold">{record.userId?.name}</div><div className="text-sm text-gray-500">{record.userId?.employeeId}</div></td>
                        <td className="p-3 text-gray-600">{record.userId?.department || '-'}</td>
                        <td className="p-3">{record.date}</td>
                        <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${record.status === 'Present' ? 'bg-green-100 text-green-800' : record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{record.status}</span></td>
                        <td className="p-3">{record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}</td>
                        <td className="p-3">{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-'}</td>
                        <td className="p-3">{record.totalHours || 0}</td>
                      </tr>
                    ))}
                    {filteredAttendance.length === 0 && (<tr><td colSpan="7" className="p-4 text-center text-gray-500">No records matching your filters.</td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;