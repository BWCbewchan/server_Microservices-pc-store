import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);

  // Nếu đang loading, hiển thị loading spinner
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập, chuyển hướng về trang đăng nhập
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập, hiển thị component
  return children;
};

export default PrivateRoute;
