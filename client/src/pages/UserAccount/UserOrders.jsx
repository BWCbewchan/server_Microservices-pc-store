import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

// API endpoints with fallbacks
const API_GATEWAY_URL = import.meta.env.VITE_APP_API_GATEWAY_URL || "http://localhost:3000";
const ORDER_API_URL = `${API_GATEWAY_URL}/orders`;


const UserOrders = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refreshData, setRefreshData] = useState(false);

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
  }, [currentUser, navigate, refreshData]);

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

  // Add new function to handle QR payment verification
  const checkPaymentStatus = async (orderId) => {
    try {
      const response = await axios.get(`${ORDER_API_URL}/${orderId}/payment-status`);
      
      if (response.data && response.data.isPaid) {
        // If payment is confirmed as paid, update the local order data
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, payment: { ...order.payment, status: 'paid' }} 
              : order
          )
        );
        
        // If currently viewing this order in the modal, update the selected order too
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({
            ...prev,
            payment: { ...prev.payment, status: 'paid' }
          }));
        }
        
        toast.success("Thanh toán thành công!");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking payment status:", error);
      return false;
    }
  };

  // Function to verify QR payment for the currently selected order
  const verifyQrPayment = async () => {
    if (!selectedOrder) return;
    
    try {
      const isPaid = await checkPaymentStatus(selectedOrder._id);
      if (!isPaid) {
        toast.info("Hệ thống đang xác nhận thanh toán của bạn. Vui lòng đợi hoặc làm mới trang sau vài phút.");
      }
    } catch (error) {
      toast.error("Không thể kiểm tra trạng thái thanh toán. Vui lòng thử lại sau.");
    }
  };

  // Add function to refresh order data
  const refreshOrderData = () => {
    setRefreshData(prev => !prev);
  };

  // Add function to manually mark payment as completed
  const markPaymentAsCompleted = async () => {
    if (!selectedOrder) return;
    
    try {
      setLoading(true);
      
      const orderId = selectedOrder._id;
      
      // Try multiple approaches to update the payment status
      let updated = false;
      
      // Approach 1: Try API Gateway with encoded update data
      try {
        const updateData = {
          'payment.status': 'paid',
          'status': selectedOrder.status === 'pending' ? 'confirmed' : selectedOrder.status
        };
        
        const encodedUpdateData = encodeURIComponent(JSON.stringify(updateData));
        await axios.put(`${ORDER_API_URL}/update/${orderId}/${encodedUpdateData}`);
        updated = true;
      } catch (err1) {
        console.warn("Failed to update payment via API Gateway:", err1.message);
        
        // Approach 2: Try direct connection to order service
        try {
          const updateData = {
            'payment.status': 'paid',
            'status': selectedOrder.status === 'pending' ? 'confirmed' : selectedOrder.status
          };
          
          const encodedUpdateData = encodeURIComponent(JSON.stringify(updateData));
          await axios.put(`${DIRECT_ORDER_API_URL}/update/${orderId}/${encodedUpdateData}`);
          updated = true;
        } catch (err2) {
          console.warn("Failed to update payment via direct connection:", err2.message);
          
          // Approach 3: Try direct PUT with JSON body
          try {
            await axios.put(`${DIRECT_ORDER_API_URL}/orders/${orderId}`, {
              'payment.status': 'paid',
              'status': selectedOrder.status === 'pending' ? 'confirmed' : selectedOrder.status
            });
            updated = true;
          } catch (err3) {
            console.error("All payment update attempts failed", err3);
          }
        }
      }
      
      if (updated) {
        // Update the local data
        setOrders(prevOrders => 
          prevOrders.map(order => {
            if (order._id === orderId) {
              return {
                ...order,
                payment: { ...order.payment, status: 'paid' },
                status: order.status === 'pending' ? 'confirmed' : order.status
              };
            }
            return order;
          })
        );
        
        // Update the selected order
        setSelectedOrder(prev => ({
          ...prev,
          payment: { ...prev.payment, status: 'paid' },
          status: prev.status === 'pending' ? 'confirmed' : prev.status
        }));
        
        toast.success("Thanh toán đã được xác nhận thành công!");
      } else {
        toast.error("Không thể cập nhật trạng thái thanh toán. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Error marking payment as completed:", error);
      toast.error("Đã xảy ra lỗi khi xác nhận thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  // Enhance the automatic payment status polling with better error handling
  useEffect(() => {
    if (!orders || orders.length === 0) return;
    
    // Find orders with pending payment status that use bank transfer
    const pendingPaymentOrders = orders.filter(order => 
      order.payment && 
      order.payment.status !== 'paid' && 
      order.payment.method !== 'cod'
    );
    
    if (pendingPaymentOrders.length === 0) return;
    
    console.log(`Found ${pendingPaymentOrders.length} pending payment orders to monitor`);
    
    // Add visual indicator that we're monitoring payments
    toast.info(`Hệ thống đang tự động kiểm tra ${pendingPaymentOrders.length} đơn hàng chờ thanh toán`, {
      autoClose: 3000,
      position: "bottom-right"
    });
    
    // Check immediately on component mount
    pendingPaymentOrders.forEach(async (order) => {
      try {
        await enhancedCheckPaymentStatus(order._id, true);
      } catch (error) {
        console.error(`Initial payment check failed for order ${order._id}:`, error);
      }
    });
    
    // Set up interval to check payment status more frequently - every 5 seconds
    const intervalId = setInterval(async () => {
      let updatedAny = false;
      
      for (const order of pendingPaymentOrders) {
        try {
          // Skip orders that have been marked as paid in the UI
          const currentOrderData = orders.find(o => o._id === order._id);
          if (currentOrderData?.payment?.status === 'paid') continue;
          
          // Check if payment is completed using the enhanced check method with silent=true
          const isPaid = await enhancedCheckPaymentStatus(order._id, true);
          
          if (isPaid) {
            console.log(`Payment for order ${order._id} has been automatically confirmed`);
            updatedAny = true;
            
            // Show a non-disruptive notification that payment was detected
            toast.success(`Thanh toán cho đơn hàng #${order._id.substring(order._id.length - 8)} đã được xác nhận!`, {
              position: "bottom-right",
              autoClose: 3000
            });
            
            // Auto-close the modal if this is the currently selected order
            if (selectedOrder && selectedOrder._id === order._id) {
              // Wait a moment for the user to see the updated status before closing
              setTimeout(() => {
                setSelectedOrder(prev => ({
                  ...prev,
                  payment: { ...prev.payment, status: 'paid' },
                  status: prev.status === 'pending' ? 'confirmed' : prev.status
                }));
              }, 1500);
            }
          }
        } catch (error) {
          console.error(`Error checking payment status for order ${order._id}:`, error);
          // Continue to next order even if there's an error
        }
      }
      
      // If we updated any orders, refresh the main list
      if (updatedAny) {
        // Use this to trigger a gentle UI refresh if needed
        setRefreshData(prev => !prev);
      }
      
      // Get fresh list of pending orders
      const stillPendingOrders = orders.filter(order => 
        order.payment && 
        order.payment.status !== 'paid' && 
        order.payment.method !== 'cod'
      );
      
      // If all orders are now paid, clear the interval
      if (stillPendingOrders.length === 0) {
        console.log("All pending payments are now verified, stopping polling");
        toast.success("Tất cả đơn hàng đã được thanh toán!", {
          position: "bottom-right",
          autoClose: 3000
        });
        clearInterval(intervalId);
      }
    }, 5000); // Check every 5 seconds
    
    // Set up a visual indicator that auto-checking is happening
    const statusCheckIndicator = setInterval(() => {
      // Find any payment method elements in the order list and add pulsing effect
      const pendingBadges = document.querySelectorAll('.badge.bg-warning');
      pendingBadges.forEach(badge => {
        badge.classList.add('pulse-animation');
        setTimeout(() => badge.classList.remove('pulse-animation'), 1000);
      });
    }, 15000); // Visual pulse every 15 seconds
    
    // Clean up all intervals on component unmount
    return () => {
      clearInterval(intervalId);
      clearInterval(statusCheckIndicator);
    };
  }, [orders, selectedOrder]);

  // Add auto-refresh for the orders list to pick up remote changes
  useEffect(() => {
    // Set up a periodic refresh of order data to catch any external updates
    const refreshInterval = setInterval(() => {
      // Only refresh if we're not loading and there are pending payments
      if (!loading && orders.some(order => 
        order.payment && 
        order.payment.status !== 'paid' && 
        order.payment.method !== 'cod'
      )) {
        setRefreshData(prev => !prev);
      }
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [loading, orders]);

  // Improve the enhancedCheckPaymentStatus function to be less verbose during automatic checks
  const enhancedCheckPaymentStatus = async (orderId, silent = false) => {
    // Don't show loading indicator during automatic checks
    if (!silent) setLoading(true);
    
    try {
      // Try multiple approaches
      let paymentVerified = false;
      
      // Method 1: Standard API check
      try {
        const response = await axios.get(`${ORDER_API_URL}/${orderId}/payment-status`);
        if (response.data && response.data.isPaid) {
          paymentVerified = true;
        }
      } catch (err1) {
        console.warn("Standard payment check failed:", err1.message);
        
        // Method 2: Direct check
        try {
          const response = await axios.get(`${DIRECT_ORDER_API_URL}/${orderId}/payment-status`);
          if (response.data && response.data.isPaid) {
            paymentVerified = true;
          }
        } catch (err2) {
          console.warn("Direct payment check failed:", err2.message);
        }
      }
      
      if (paymentVerified) {
        // Update orders in state
        setOrders(prevOrders => 
          prevOrders.map(order => {
            if (order._id === orderId) {
              return {
                ...order,
                payment: { ...order.payment, status: 'paid' },
                status: order.status === 'pending' ? 'confirmed' : order.status
              };
            }
            return order;
          })
        );
        
        // Update selected order if applicable
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(prev => ({
            ...prev,
            payment: { ...prev.payment, status: 'paid' },
            status: prev.status === 'pending' ? 'confirmed' : prev.status
          }));
        }
        
        // Only show toast for manual checks, not automatic ones
        if (!silent) {
          toast.success("Thanh toán của bạn đã được xác nhận!");
        }
        return true;
      }
      
      // Only show info message for manual checks
      if (!silent) {
        toast.info("Hệ thống chưa ghi nhận thanh toán của bạn. Vui lòng đợi hoặc xác nhận lại sau.");
      }
      return false;
    } catch (error) {
      console.error("Error checking payment status:", error);
      // Only show error toast for manual checks
      if (!silent) {
        toast.error("Không thể kiểm tra trạng thái thanh toán.");
      }
      return false;
    } finally {
      // Only update loading state for manual checks
      if (!silent) setLoading(false);
    }
  };
  
  return (
    <div className="container my-5">
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
          .pulse-animation {
            animation: pulse 1s;
          }
        `}
      </style>
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
                    <p className="mb-1"><strong>Phương thức thanh toán:</strong> {selectedOrder.payment.method === 'cod' ? 'Thanh toán khi nhận hàng' : selectedOrder.payment.method === 'bank' ? 'Chuyển khoản ngân hàng' : 'Thanh toán QR'}</p>
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
                
                {/* Payment verification buttons */}
                {selectedOrder.payment && 
                 selectedOrder.payment.method !== 'cod' && 
                 selectedOrder.payment.status !== 'paid' && (
                  <div className="me-auto">
                    <button 
                      className="btn btn-warning me-2" 
                      onClick={() => enhancedCheckPaymentStatus(selectedOrder._id)}
                      disabled={loading}
                    >
                      {loading ? 'Đang kiểm tra...' : 'Kiểm tra thanh toán'}
                    </button>
                    <button 
                      className="btn btn-success me-2" 
                      onClick={markPaymentAsCompleted}
                      disabled={loading}
                    >
                      {loading ? 'Đang xử lý...' : 'Xác nhận đã thanh toán'}
                    </button>
                  </div>
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
