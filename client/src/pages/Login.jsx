import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employeeId: '',
    department: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isRegister 
      ? 'http://localhost:5000/api/auth/register' 
      : 'http://localhost:5000/api/auth/login';

    try {
      const res = await axios.post(url, formData);
      dispatch(loginSuccess(res.data));
      alert(isRegister ? 'Registration Successful! Please Login.' : 'Login Successful!');
      if (isRegister) setIsRegister(false); 
      else navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden">
      
      {/* Background Glow Effects */}
      <div className="absolute top-[-50px] left-[-50px] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-[-50px] right-[-50px] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-50px] left-[20%] w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Login Card */}
      <div className="relative bg-gray-800 border border-gray-700 p-8 rounded-2xl shadow-2xl w-full max-w-md z-10">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white tracking-wide">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            {isRegister ? 'Join the team and start tracking' : 'Please sign in to continue'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegister && (
            <div className="space-y-4 animate-fade-in-up">
              <input type="text" name="name" placeholder="Full Name" onChange={handleChange} 
                className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400" required />
              
              <div className="flex gap-4">
                <input type="text" name="employeeId" placeholder="Emp ID" onChange={handleChange} 
                  className="w-1/2 bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400" required />
                <input type="text" name="department" placeholder="Dept" onChange={handleChange} 
                  className="w-1/2 bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400" required />
              </div>
            </div>
          )}
          
          <input type="email" name="email" placeholder="Email Address" onChange={handleChange} 
            className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400" required />
          
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" 
              placeholder="Password" 
              onChange={handleChange} 
              className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400" 
              required 
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>
          
          <button type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold p-3 rounded-lg shadow-lg transform transition-all hover:-translate-y-1 hover:shadow-blue-500/25"
          >
            {isRegister ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button 
              className="text-blue-400 font-semibold ml-2 hover:text-blue-300 hover:underline transition-colors" 
              onClick={() => {
                setIsRegister(!isRegister);
                setFormData({ name: '', email: '', password: '', employeeId: '', department: '' });
              }}
            >
              {isRegister ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;