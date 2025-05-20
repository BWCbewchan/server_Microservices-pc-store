import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

const PrivateRoute = ({ children }) => {
  const { currentUser, loading, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    // Show loading spinner while checking authentication
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Enhanced authentication check
  if (!currentUser) {
    // Even if currentUser is null, check if we have stored user data
    if (!isAuthenticated()) {
      // No stored user data, redirect to login
      toast.info("Vui lòng đăng nhập để tiếp tục");
      
      return (
        <Navigate 
          to="/login" 
          state={{ returnTo: location.pathname }} 
          replace 
        />
      );
    }
    
    // We have stored user data but no currentUser - this is fine, let them through
    console.log("Using stored user data for protected route");
  }
  
  // User is authenticated
  return children;
};

export default PrivateRoute;
