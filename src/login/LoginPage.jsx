// src/login/LoginPage.js
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, checkAuth } from '../redux/authSlice';
import axios from 'axios';
import { getConfig } from '../config/activeConfig';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Check auth status on component mount
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic client-side validation
    if (!email || !password) {
      toast.error('Please enter both email and password', {
        duration: 2000, // 2 seconds
      });
      setIsLoading(false);
      return;
    }

    try {
      const config = getConfig();
      const response = await axios.post(config.loginEndpoint, { 
        username: email,
        password 
      });

      // Validate API response
      if (response.data.status !== 'Success') {
        throw new Error(response.data.message || 'Login failed');
      }

      // Parse the token to get expiration time
      const token = response.data.token;
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = new Date(tokenData.exp * 1000).toISOString();

      dispatch(loginSuccess({
        token,
        user: { email },
        expiresAt
      }));

      toast.success('Login successful!', {
        duration: 2000, // 2 seconds
      });

      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      toast.error(errorMessage, {
        duration: 2000, // 2 seconds
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full relative p-[2px] rounded-xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-blue-500 animate-rotate-colors">
        <style jsx global>{`
          @keyframes rotate-colors {
            0% {
              background-position: 0% 50%;
            }
            100% {
              background-position: 100% 50%;
            }
          }
          .animate-rotate-colors {
            background-size: 200% 200%;
            animation: rotate-colors 3s linear infinite;
          }
        `}</style>
        
        <div className="bg-gray-900 rounded-xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">
              <span className="text-purple-400">DJ</span> Login
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white py-3 rounded-lg font-medium transition duration-300 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}