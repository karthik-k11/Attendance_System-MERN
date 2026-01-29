import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { useSelector } from 'react-redux';

// Protected Route Component
const PrivateRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;