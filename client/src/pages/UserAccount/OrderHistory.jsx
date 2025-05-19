import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const userId = currentUser?.id;
        if (!userId) return;

        const response = await axios.get(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/orders/user/${userId}`);
        setOrders(response.data || []);
      } catch (error) {
        console.error('Lỗi khi tải lịch sử đơn hàng:', error);
        toast.error('Không thể tải lịch sử đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  // Hàm xử lý hủy đơn hàng
  const handleCancelOrder = async (orderId) => {
    try {
      if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
      
      await axios.post(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/orders/cancel/${orderId}`);
      
      // Cập nhật trạng thái đơn hàng trong state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: 'cancelled' } 
            : order
        )
      );
      
      toast.success('Hủy đơn hàng thành công');
    } catch (error) {
      console.error('Lỗi khi hủy đơn hàng:', error);
      toast.error('Không thể hủy đơn hàng. ' + (error.response?.data?.message || ''));
    }
  };

  // Hàm lấy màu cho trạng thái đơn hàng
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-warning';
      case 'confirmed': return 'text-primary';
      case 'shipping': return 'text-info';
      case 'delivered': return 'text-success';
      case 'cancelled': return 'text-danger';
      default: return '';
    }
  };

  // Hàm hiển thị tên trạng thái đơn hàng tiếng Việt
  const getStatusName = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipping': return 'Đang vận chuyển';
      case 'delivered': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className="container my-5">
      <h2 className="mb-4">Lịch sử đơn hàng</h2>
      
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Đang tải đơn hàng...</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Mã đơn hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Phương thức</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id.slice(-8).toUpperCase()}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>{Number(order.finalTotal).toLocaleString('vi-VN')} ₫</td>
                  <td className={getStatusColor(order.status)}>
                    {getStatusName(order.status)}
                  </td>
                  <td>
                    {order.payment?.method === 'cod' ? 'Thanh toán khi nhận hàng' : 
                     order.payment?.method === 'bank' ? 'Chuyển khoản ngân hàng' : 
                     order.payment?.method}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link to={`/order/${order._id}`} className="btn btn-sm btn-outline-primary">
                        Chi tiết
                      </Link>
                      
                      {/* Chỉ hiển thị nút hủy nếu đơn hàng đang ở trạng thái "pending" */}
                      {order.status === 'pending' && (
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleCancelOrder(order._id)}
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center p-5 bg-light">
          <p className="mb-3">Bạn chưa có đơn hàng nào</p>
          <Link to="/catalog" className="btn btn-primary">
            Mua sắm ngay
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
