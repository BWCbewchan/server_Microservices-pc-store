import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Try to get order from location state first
    let orderData = location.state?.order;

    // If not available, try localStorage
    if (!orderData) {
      try {
        const lastOrderStr = localStorage.getItem('lastOrder');
        if (lastOrderStr) {
          orderData = JSON.parse(lastOrderStr);
          console.log("Retrieved order from localStorage");
        }
      } catch (error) {
        console.error("Error retrieving order from localStorage:", error);
      }
    }

    if (!orderData) {
      toast.error("Không tìm thấy thông tin đơn hàng");
      navigate('/home');
      return;
    }

    setOrder(orderData);

    // Final cart check/clear as safety measure
    if (!location.state?.cartCleared) {
      console.log("Running final cart clearing check");
      const userId = orderData.userId;

      if (userId) {
        try {
          // Run this in background
          fetch(`http://localhost:3000/api/cart/clear/${userId}`, { method: 'DELETE' })
            .catch(e => console.warn("Background cart clear failed:", e));
        } catch (e) {
          console.warn("Error in final cart clear attempt:", e);
        }
      }
    }

    // Clear temporary order data after 10 minutes
    const clearTimer = setTimeout(() => {
      localStorage.removeItem('lastOrder');
    }, 10 * 60 * 1000);

    return () => clearTimeout(clearTimer);
  }, [location, navigate]);

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  if (!order) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <div className="bg-success text-white d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: "80px", height: "80px" }}>
                  <i className="fas fa-check-circle fa-3x"></i>
                </div>
                <h2 className="fs-3 fw-bold text-success mb-2">Đặt hàng thành công!</h2>
                <p className="text-muted">Cảm ơn bạn đã mua sắm tại PC Store</p>
              </div>

              <div className="border-bottom pb-3 mb-3">
                <div className="d-flex justify-content-between">
                  <div>
                    <h5 className="fw-bold">Mã đơn hàng</h5>
                    <p className="text-muted">#{order._id}</p>
                  </div>
                  <div className="text-end">
                    <h5 className="fw-bold">Ngày đặt hàng</h5>
                    <p className="text-muted">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="fw-bold mb-3">Thông tin giao hàng</h5>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <p className="fw-medium mb-1">Người nhận:</p>
                    <p className="text-muted">{order.customer.name}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <p className="fw-medium mb-1">Số điện thoại:</p>
                    <p className="text-muted">{order.customer.phone}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <p className="fw-medium mb-1">Email:</p>
                    <p className="text-muted">{order.customer.email}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <p className="fw-medium mb-1">Địa chỉ:</p>
                    <p className="text-muted">{order.customer.address}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="fw-bold mb-3">Sản phẩm đã mua</h5>
                <div className="table-responsive">
                  <table className="table">
                    <thead className="table-light">
                      <tr>
                        <th>Sản phẩm</th>
                        <th className="text-center">Số lượng</th>
                        <th className="text-end">Đơn giá</th>
                        <th className="text-end">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">{formatPrice(item.price)}</td>
                          <td className="text-end">{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-light p-3 rounded mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(order.finalTotal - order.shipping.fee)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Phí vận chuyển:</span>
                  <span>{formatPrice(order.shipping.fee)}</span>
                </div>
                <div className="d-flex justify-content-between fw-bold fs-5 mt-3 pt-3 border-top">
                  <span>Tổng cộng:</span>
                  <span className="text-danger">{formatPrice(order.finalTotal)}</span>
                </div>
              </div>

              <div className="text-center mt-4">
                <Link to="/home" className="btn btn-primary mx-2">
                  Tiếp tục mua sắm
                </Link>
                <Link to="/userAccount/orders" className="btn btn-outline-secondary mx-2">
                  Xem đơn hàng của tôi
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
