import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../api/index';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('admin@sewerguard.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [demoUsers, setDemoUsers] = useState([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDemoUsers();
  }, []);

  const fetchDemoUsers = async () => {
    try {
      const response = await authAPI.demoUsers();
      setDemoUsers(response.data.demoUsers);
    } catch (error) {
      console.error('Error fetching demo users:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;

      login(user, token);
      toast.success('Login successful!');

      // Navigate based on role
      const dashboardPath = {
        admin: '/admin/dashboard',
        supervisor: '/supervisor/dashboard',
        worker: '/worker/dashboard'
      };

      navigate(dashboardPath[user.role] || '/');
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Login failed');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoUser) => {
    setEmail(demoUser.email);
    setPassword(demoUser.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white rounded-full mb-4">
            <span className="text-4xl">🌊</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">SewerGuard</h1>
          <p className="text-blue-200">Smart Sewer Management System</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Login</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>

        {/* Demo Users */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Demo Accounts</h3>
          <p className="text-gray-600 text-sm mb-4">
            Click on any demo account to quickly login:
          </p>

          <div className="space-y-2">
            {demoUsers.map((user, index) => (
              <button
                key={index}
                onClick={() => handleQuickLogin(user)}
                className="w-full text-left p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition"
              >
                <p className="font-semibold text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                <p className="text-xs text-gray-500">{user.email} • Password: {user.password}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-blue-200 text-sm">
          <p>© 2024 SewerGuard. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
