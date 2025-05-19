import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';

const UserAccount = () => {
  const { currentUser, updateProfile, logout } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    street: currentUser?.address?.street || '',
    city: currentUser?.address?.city || '',
    state: currentUser?.address?.state || '',
    zipCode: currentUser?.address?.zipCode || '',
    country: currentUser?.address?.country || 'Vietnam',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Định dạng dữ liệu cho API
      const userData = {
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        }
      };
      
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
                onClick={logout}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="col-lg-9">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Thông tin cá nhân</h4>
              {!isEditing && (
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => setIsEditing(true)}
                >
                  Chỉnh sửa
                </button>
              )}
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
        </div>
      </div>
    </div>
  );
};

export default UserAccount;
