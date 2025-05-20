import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

// API endpoints with fallbacks
const API_GATEWAY_URL = import.meta.env.VITE_APP_API_GATEWAY_URL || "http://localhost:3000";
const ORDER_API_URL = `${API_GATEWAY_URL}/api/orders`;
const DIRECT_ORDER_API_URL = "http://localhost:4009";

const UserOrders = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) {
        // Check if we have user in localStorage
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          toast.error("Vui lòng đăng nhập để xem đơn hàng");
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

        // Try API Gateway first
        try {
          console.log(`Fetching orders from API Gateway for user: ${userId}`);
          const response = await axios.get(`${ORDER_API_URL}/user/${userId}`, { timeout: 5000 });
          setOrders(response.data);
          console.log("Orders fetched successfully", response.data);
        } catch (apiError) {
          console.warn("Failed to fetch orders from API Gateway:", apiError.message);

          // Try direct connection as fallback
          try {
            console.log(`Trying direct connection to order service for user: ${userId}`);
            const directResponse = await axios.get(`${DIRECT_ORDER_API_URL}/user/${userId}`, { timeout: 5000 });
            setOrders(directResponse.data);
            console.log("Orders fetched successfully via direct connection");
          } catch (directError) {
            console.error("Failed to fetch orders via direct connection:", directError.message);
            throw new Error("Không thể kết nối đến máy chủ đơn hàng");
          }
        }
      } catch (err) {
        setError(err.message);
        toast.error(`Lỗi khi tải đơn hàng: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser, navigate]);

  const handleLogout = () => {
    logout();
    toast.info("Đăng xuất thành công");
    navigate("/login");
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning';
      case 'confirmed': return 'bg-info';
      case 'completed': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
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
                <Link to="/userAccount/orders" className="list-group-item list-group-item-action active">
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
          
          {/* Main content - loading */}
          <div className="col-lg-9">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Lịch sử đơn hàng</h5>
              </div>
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
                <p className="mt-3">Đang tải danh sách đơn hàng của bạn...</p>
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
                <Link to="/userAccount/orders" className="list-group-item list-group-item-action active">
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
          
          {/* Main content - error */}
          <div className="col-lg-9">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Lịch sử đơn hàng</h5>
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
              <Link to="/userAccount/orders" className="list-group-item list-group-item-action active">
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
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Lịch sử đơn hàng</h5>
              <span className="badge bg-primary">{orders.length} đơn hàng</span>
            </div>
            <div className="card-body p-0">
              {orders.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-shopping-bag fa-3x mb-3 text-muted"></i>
                  <h5>Bạn chưa có đơn hàng nào</h5>
                  <p className="text-muted">Hãy tiếp tục mua sắm để đặt đơn hàng đầu tiên của bạn</p>
                  <Link to="/catalog" className="btn btn-primary mt-2">
                    Tiếp tục mua sắm
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Mã đơn hàng</th>
                        <th>Ngày đặt</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th>Vận chuyển</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td>
                            <span className="fw-medium">#{order._id.substring(order._id.length - 8)}</span>
                          </td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td className="fw-bold">{formatPrice(order.finalTotal)}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-info text-dark">
                              {order.shipping.method === 'standard' ? 'Tiêu chuẩn' : 'Nhanh'}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleViewDetails(order)}
                            >
                              Chi tiết
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Chi tiết đơn hàng #{selectedOrder._id.substring(selectedOrder._id.length - 8)}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseDetails}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="fw-bold">Thông tin đơn hàng</h6>
                    <p className="mb-1"><strong>Ngày đặt:</strong> {formatDate(selectedOrder.createdAt)}</p>
                    <p className="mb-1">
                      <strong>Trạng thái:</strong> 
                      <span className={`badge ${getStatusBadgeClass(selectedOrder.status)} ms-2`}>
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </p>
                    <p className="mb-1"><strong>Phương thức thanh toán:</strong> {selectedOrder.payment.method === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}</p>
                    <p className="mb-1">
                      <strong>Trạng thái thanh toán:</strong> 
                      <span className={`badge ${selectedOrder.payment.status === 'paid' ? 'bg-success' : 'bg-warning'} ms-2`}>
                        {selectedOrder.payment.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold">Thông tin khách hàng</h6>
                    <p className="mb-1"><strong>Tên:</strong> {selectedOrder.customer.name}</p>
                    <p className="mb-1"><strong>Địa chỉ:</strong> {selectedOrder.customer.address}</p>
                    <p className="mb-1"><strong>Điện thoại:</strong> {selectedOrder.customer.phone}</p>
                    <p className="mb-1"><strong>Email:</strong> {selectedOrder.customer.email}</p>
                  </div>
                </div>
                
                <h6 className="fw-bold">Sản phẩm đặt mua</h6>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Sản phẩm</th>
                        <th width="10%">Số lượng</th>
                        <th width="15%">Đơn giá</th>
                        <th width="15%">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">{formatPrice(item.price)}</td>
                          <td className="text-end fw-bold">{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="table-light">
                      <tr>
                        <td colSpan="3" className="text-end"><strong>Tổng tiền sản phẩm:</strong></td>
                        <td className="text-end">{formatPrice(selectedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="text-end"><strong>Phí vận chuyển:</strong></td>
                        <td className="text-end">{formatPrice(selectedOrder.shipping.fee)}</td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="text-end"><strong>Tổng thanh toán:</strong></td>
                        <td className="text-end fw-bold fs-5">{formatPrice(selectedOrder.finalTotal)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                {selectedOrder.notes && selectedOrder.notes.customerNote && (
                  <div className="mt-3">
                    <h6 className="fw-bold">Ghi chú đơn hàng</h6>
                    <p className="border p-2 rounded">{selectedOrder.notes.customerNote}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                {selectedOrder.status === 'pending' && (
                  <button className="btn btn-danger me-auto">Hủy đơn hàng</button>
                )}
                <button className="btn btn-secondary" onClick={handleCloseDetails}>Đóng</button>
                <button className="btn btn-primary">In đơn hàng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;
