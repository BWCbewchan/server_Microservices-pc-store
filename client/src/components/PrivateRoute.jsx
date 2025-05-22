import { useContext, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    // If user is logged in but not verified
    if (currentUser && !currentUser.isVerified) {
      toast.warning('Vui lòng xác thực tài khoản của bạn để tiếp tục');
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated()) {
    toast.error('Vui lòng đăng nhập để tiếp tục');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is not verified, redirect to verification page
  if (currentUser && !currentUser.isVerified) {
    return <Navigate to="/verify" state={{ email: currentUser.email, from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
