// src/components/ProtectedRoute.js
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { checkAuth } from '../redux/authSlice';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, expiresAt } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Check token expiration periodically (every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(checkAuth());
    }, 60 * 1000); // Check every minute
    return () => clearInterval(interval);
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || (expiresAt && new Date(expiresAt) <= new Date())) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;