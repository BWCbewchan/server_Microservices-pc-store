import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

const UserAccount = () => {
  const { currentUser, updateProfile, logout, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    dateOfBirth: "",
    gender: ""
  });

  // Load user data when component mounts or currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        street: currentUser.address?.street || "",
        city: currentUser.address?.city || "",
        state: currentUser.address?.state || "",
        zipCode: currentUser.address?.zipCode || "",
        country: currentUser.address?.country || "",
        dateOfBirth: currentUser.dateOfBirth || "",
        gender: currentUser.gender || ""
      });
    } else {
      // If no current user, check if we need to redirect
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Bạn cần đăng nhập để xem trang này");
        navigate("/login");
      }
    }
  }, [currentUser, navigate]);

  // Handler for form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Format data for API
      const userData = {
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender
      };
      
      console.log("Submitting user data update:", userData);
      
      const result = await updateProfile(userData);
      
      if (result.success) {
        toast.success('Cập nhật thông tin thành công!');
        setIsEditing(false);
      } else {
        toast.error(result.message || 'Cập nhật thông tin thất bại');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Đã xảy ra lỗi khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };
  
  // Handler for logout
  const handleLogout = () => {
    const success = logout();
    if (success) {
      toast.info("Đăng xuất thành công");
      navigate("/login");
    } else {
      toast.error("Có lỗi khi đăng xuất");
    }
  };
  
  // Show loading indicator while auth state is loading
  if (authLoading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Đang tải thông tin tài khoản...</p>
      </div>
    );
  }
  
  // Show detailed profile information at the top
  return (
    <div className="container my-5">
      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-3 mb-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              Tài khoản của tôi
            </div>
            <div className="list-group list-group-flush">
              <Link to="/userAccount" className="list-group-item list-group-item-action active">
                Thông tin cá nhân
              </Link>
              <Link to="/userAccount/orders" className="list-group-item list-group-item-action">
                Lịch sử đơn hàng
              </Link>
              <Link to="/userAccount/wishlist" className="list-group-item list-group-item-action">
                Sản phẩm yêu thích
              </Link>
              <button 
                className="list-group-item list-group-item-action text-danger"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="col-lg-9">
          {/* User Profile Summary Card */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: "80px", height: "80px" }}>
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="Avatar" className="rounded-circle img-fluid" />
                  ) : (
                    <i className="fas fa-user-circle text-secondary" style={{ fontSize: "50px" }}></i>
                  )}
                </div>
                <div>
                  <h3 className="mb-1">{currentUser?.name || 'Người dùng'}</h3>
                  <p className="text-muted mb-0">{currentUser?.email}</p>
                  <small className="text-muted">Thành viên từ: {new Date(currentUser?.createdAt || Date.now()).toLocaleDateString('vi-VN')}</small>
                </div>
              </div>
              
              <div className="row g-3 mt-2">
                <div className="col-md-6">
                  <div className="border rounded p-3">
                    <h5 className="fw-bold mb-2"><i className="fas fa-phone-alt me-2 text-primary"></i>Liên hệ</h5>
                    <p className="mb-1"><strong>Email:</strong> {currentUser?.email}</p>
                    <p className="mb-1"><strong>Điện thoại:</strong> {currentUser?.phone || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="border rounded p-3">
                    <h5 className="fw-bold mb-2"><i className="fas fa-map-marker-alt me-2 text-primary"></i>Địa chỉ</h5>
                    <p className="mb-1">
                      {currentUser?.address?.street ? (
                        <>
                          {currentUser.address.street}, {currentUser.address.city || ''}, 
                          {currentUser.address.state ? ` ${currentUser.address.state},` : ''} 
                          {currentUser.address.country || 'Việt Nam'}
                        </>
                      ) : (
                        'Chưa cập nhật địa chỉ'
                      )}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="d-flex justify-content-end mt-3">
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => setIsEditing(true)}
                >
                  <i className="fas fa-edit me-2"></i>Chỉnh sửa thông tin
                </button>
              </div>
            </div>
          </div>

          {/* Edit Form - only show when editing */}
          {isEditing ? (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Cập nhật thông tin cá nhân</h4>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="name" className="form-label">Họ tên</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        required
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={formData.email}
                        disabled={true} // Email không thể chỉnh sửa
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="phone" className="form-label">Số điện thoại</label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="dateOfBirth" className="form-label">Ngày sinh</label>
                      <input
                        type="date"
                        className="form-control"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="gender" className="form-label">Giới tính</label>
                      <select
                        className="form-select"
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        disabled={!isEditing}
                      >
                        <option value="">Chọn giới tính</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                    
                    <div className="col-12 mt-4 mb-2">
                      <h5>Địa chỉ</h5>
                    </div>
                    
                    <div className="col-12 mb-3">
                      <label htmlFor="street" className="form-label">Địa chỉ</label>
                      <input
                        type="text"
                        className="form-control"
                        id="street"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="city" className="form-label">Thành phố</label>
                      <input
                        type="text"
                        className="form-control"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="state" className="form-label">Tỉnh/Thành</label>
                      <input
                        type="text"
                        className="form-control"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="zipCode" className="form-label">Mã bưu điện</label>
                      <input
                        type="text"
                        className="form-control"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="country" className="form-label">Quốc gia</label>
                      <input
                        type="text"
                        className="form-control"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  {isEditing && (
                    <div className="mt-3 d-flex gap-2">
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Đang lưu...
                          </>
                        ) : 'Lưu thay đổi'}
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={() => setIsEditing(false)}
                        disabled={loading}
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default UserAccount;
