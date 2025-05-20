import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

const UserWishlist = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!currentUser) {
        // Check if we have user in localStorage
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          toast.error("Vui lòng đăng nhập để xem danh sách yêu thích");
          navigate("/login");
          return;
        }
      }

      // Get userId from current user or localStorage
      let userId;
      if (currentUser) {
        userId = currentUser.id || currentUser._id;
      } else {
        const userData = JSON.parse(localStorage.getItem('user'));
        userId = userData.id || userData._id;
      }

      try {
        setLoading(true);
        setError(null);
        
        // This is a placeholder API - replace with your actual endpoint
        // const response = await axios.get(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/wishlist/${userId}`);
        // For now, we'll use dummy data since the API isn't implemented yet
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dummy data for development until API is ready
        const dummyWishlist = [
          {
            productId: "60d21b4667d0d8992e610c85",
            name: "MSI MPG Trident 3",
            image: "https://via.placeholder.com/300x300",
            price: 1499.99
          },
          {
            productId: "60d21b4667d0d8992e610c86",
            name: "ASUS ROG Strix G15",
            image: "https://via.placeholder.com/300x300",
            price: 1299.99
          }
        ];
        
        setWishlist(dummyWishlist);
      } catch (err) {
        setError("Không thể tải danh sách yêu thích");
        console.error("Error fetching wishlist:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [currentUser, navigate]);

  const handleLogout = () => {
    logout();
    toast.info("Đăng xuất thành công");
    navigate("/login");
  };

  const handleRemoveFromWishlist = async (productId) => {
    // Placeholder for wishlist removal
    setWishlist(prevWishlist => prevWishlist.filter(item => item.productId !== productId));
    toast.success("Đã xóa sản phẩm khỏi danh sách yêu thích");
  };

  // Render loading state
  if (loading) {
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
                <Link to="/userAccount" className="list-group-item list-group-item-action">
                  Thông tin cá nhân
                </Link>
                <Link to="/userAccount/orders" className="list-group-item list-group-item-action">
                  Lịch sử đơn hàng
                </Link>
                <Link to="/userAccount/wishlist" className="list-group-item list-group-item-action active">
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
          
          {/* Main content - loading */}
          <div className="col-lg-9">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Sản phẩm yêu thích</h5>
              </div>
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
                <p className="mt-3">Đang tải danh sách sản phẩm yêu thích...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
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
                <Link to="/userAccount" className="list-group-item list-group-item-action">
                  Thông tin cá nhân
                </Link>
                <Link to="/userAccount/orders" className="list-group-item list-group-item-action">
                  Lịch sử đơn hàng
                </Link>
                <Link to="/userAccount/wishlist" className="list-group-item list-group-item-action active">
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
          
          {/* Main content - error */}
          <div className="col-lg-9">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Sản phẩm yêu thích</h5>
              </div>
              <div className="card-body">
                <div className="alert alert-danger" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
                <div className="text-center mt-3">
                  <button className="btn btn-primary" onClick={() => window.location.reload()}>
                    Thử lại
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main content - loaded successfully
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
              <Link to="/userAccount" className="list-group-item list-group-item-action">
                Thông tin cá nhân
              </Link>
              <Link to="/userAccount/orders" className="list-group-item list-group-item-action">
                Lịch sử đơn hàng
              </Link>
              <Link to="/userAccount/wishlist" className="list-group-item list-group-item-action active">
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
        
        {/* Main content - wishlist items */}
        <div className="col-lg-9">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Sản phẩm yêu thích</h5>
              <span className="badge bg-primary">{wishlist.length} sản phẩm</span>
            </div>
            <div className="card-body">
              {wishlist.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-heart text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                  <p className="mb-3">Bạn chưa có sản phẩm yêu thích nào</p>
                  <Link to="/catalog" className="btn btn-primary">
                    Khám phá sản phẩm ngay
                  </Link>
                </div>
              ) : (
                <div className="row g-3">
                  {wishlist.map((item) => (
                    <div key={item.productId} className="col-md-6 col-lg-4">
                      <div className="card h-100 position-relative">
                        <button 
                          className="btn btn-sm position-absolute end-0 top-0 text-danger m-2"
                          onClick={() => handleRemoveFromWishlist(item.productId)}
                          title="Xóa khỏi danh sách yêu thích"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                        <Link to={`/details/${item.productId}`}>
                          <img 
                            src={item.image || "https://via.placeholder.com/150"} 
                            className="card-img-top p-3" 
                            alt={item.name}
                            style={{ height: "200px", objectFit: "contain" }}
                          />
                        </Link>
                        <div className="card-body">
                          <h6 className="card-title">
                            <Link to={`/details/${item.productId}`} className="text-decoration-none text-dark">
                              {item.name}
                            </Link>
                          </h6>
                          <p className="card-text text-primary fw-bold">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                          </p>
                        </div>
                        <div className="card-footer bg-white border-top-0">
                          <button 
                            className="btn btn-primary w-100"
                            onClick={() => {
                              toast.success(`Đã thêm ${item.name} vào giỏ hàng`);
                            }}
                          >
                            <i className="fas fa-shopping-cart me-2"></i>
                            Thêm vào giỏ hàng
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserWishlist;
