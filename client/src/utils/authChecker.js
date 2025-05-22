import { toast } from 'react-toastify';

/**
 * Checks if user is authenticated and verified
 * @param {Object} currentUser - The current user object from AuthContext
 * @param {Function} navigate - React Router's navigate function
 * @param {boolean} verificationRequired - Whether verification is required
 * @returns {boolean} - Whether the user can proceed
 */
export const checkAuthBeforeCart = (currentUser, navigate) => {
  // Check if user is logged in
  if (!currentUser) {
    toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
    navigate("/login");
    return false;
  }

  // Check if user's account is verified
  if (!currentUser.isVerified) {
    toast.warning("Vui lòng xác thực tài khoản để thêm sản phẩm vào giỏ hàng");
    navigate("/verify", { 
      state: { 
        email: currentUser.email,
        fromCart: true 
      }
    });
    return false;
  }

  return true;
};
