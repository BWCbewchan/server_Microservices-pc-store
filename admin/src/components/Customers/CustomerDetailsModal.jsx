import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";

// Constants
const USER_API_URL = "http://localhost:3000/api/users"; // Adjust as needed
const ORDER_API_URL = "http://localhost:3000/api/orders"; // Adjust as needed

export default function CustomerDetailsModal({ userId, onClose }) {
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("info"); // 'info', 'orders', 'activity'

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);

        // Fetch customer details
        const customerResponse = await axios.get(`${USER_API_URL}/${userId}`);
        setCustomer(customerResponse.data);

        // Fetch customer orders
        const ordersResponse = await axios.get(`${ORDER_API_URL}/user/${userId}`);
        setOrders(ordersResponse.data || []);
      } catch (err) {
        console.error("Error fetching customer data:", err);
        setError("Không thể tải thông tin khách hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [userId]);

  // Calculate customer statistics
  const calculateStats = () => {
    if (!orders || orders.length === 0) {
      return {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        completedOrders: 0,
        cancelledOrders: 0
      };
    }

    const completedOrders = orders.filter(order => order.status === "completed").length;
    const cancelledOrders = orders.filter(order => order.status === "cancelled").length;
    
    const totalSpent = orders.reduce((sum, order) => {
      return order.status !== "cancelled" ? sum + order.finalTotal : sum;
    }, 0);

    return {
      totalOrders: orders.length,
      totalSpent,
      averageOrderValue: totalSpent / (orders.length - cancelledOrders || 1),
      completedOrders,
      cancelledOrders
    };
  };

  const stats = calculateStats();

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center overflow-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b px-6 py-4 sticky top-0 bg-white z-10 flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Thông tin khách hàng</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* Loading and Error States */}
        {loading ? (
          <div className="p-6 text-center">Đang tải thông tin...</div>
        ) : error ? (
          <div className="p-6 text-red-500 text-center">{error}</div>
        ) : (
          <>
            {/* Tabs */}
            <div className="border-b">
              <div className="flex px-6">
                <button
                  className={`py-3 px-4 border-b-2 font-medium text-sm ${
                    activeTab === "info"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("info")}
                >
                  Thông tin cá nhân
                </button>
                <button
                  className={`py-3 px-4 border-b-2 font-medium text-sm ${
                    activeTab === "orders"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("orders")}
                >
                  Đơn hàng
                </button>
                <button
                  className={`py-3 px-4 border-b-2 font-medium text-sm ${
                    activeTab === "activity"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("activity")}
                >
                  Hoạt động
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === "info" && (
                <div className="space-y-8">
                  {/* Customer Overview */}
                  <div className="flex items-start gap-4">
                    <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-700">
                        {customer?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{customer?.name}</h3>
                      <p className="text-gray-600">{customer?.email}</p>
                      <p className="mt-1 text-sm">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          customer?.isActive 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {customer?.isActive ? "Hoạt động" : "Đã khóa"}
                        </span>
                        <span className="ml-2 text-gray-500">
                          Tham gia: {customer?.createdAt ? format(new Date(customer.createdAt), 'dd/MM/yyyy') : 'N/A'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Customer Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-500">Tổng chi tiêu</p>
                      <p className="text-2xl font-bold">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(stats.totalSpent)}
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-500">Số đơn hàng</p>
                      <p className="text-2xl font-bold">{stats.totalOrders}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-gray-500">Giá trị đơn trung bình</p>
                      <p className="text-2xl font-bold">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(stats.averageOrderValue)}
                      </p>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Thông tin cá nhân</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Họ tên</p>
                        <p>{customer?.name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p>{customer?.email || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Số điện thoại</p>
                        <p>{customer?.phone || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Địa chỉ</p>
                        <p>{customer?.address || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information (if available) */}
                  {customer?.birthdate && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Thông tin khác</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Ngày sinh</p>
                          <p>{format(new Date(customer.birthdate), 'dd/MM/yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Giới tính</p>
                          <p>{customer?.gender || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "orders" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Lịch sử đơn hàng</h3>
                    <div className="text-sm text-gray-500">
                      Tổng số: {orders.length} đơn hàng
                    </div>
                  </div>

                  {orders.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">Khách hàng chưa có đơn hàng nào</p>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đặt</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap">
                                {order._id.substring(order._id.length - 8)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(order.finalTotal)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  order.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "activity" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Nhật ký hoạt động</h3>
                  
                  <div className="space-y-4">
                    {/* Account Creation */}
                    <div className="border-l-2 border-blue-500 pl-4 pb-4">
                      <div className="flex items-center">
                        <div className="rounded-full bg-blue-100 p-2 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">Tạo tài khoản</p>
                          <p className="text-sm text-gray-500">
                            {customer?.createdAt ? format(new Date(customer.createdAt), 'dd/MM/yyyy HH:mm') : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Last Login */}
                    {customer?.lastLogin && (
                      <div className="border-l-2 border-green-500 pl-4 pb-4">
                        <div className="flex items-center">
                          <div className="rounded-full bg-green-100 p-2 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Đăng nhập gần nhất</p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(customer.lastLogin), 'dd/MM/yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* First Order */}
                    {orders.length > 0 && (
                      <div className="border-l-2 border-purple-500 pl-4 pb-4">
                        <div className="flex items-center">
                          <div className="rounded-full bg-purple-100 p-2 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Đơn hàng đầu tiên</p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(orders[orders.length - 1].createdAt), 'dd/MM/yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Latest Order */}
                    {orders.length > 0 && (
                      <div className="border-l-2 border-yellow-500 pl-4">
                        <div className="flex items-center">
                          <div className="rounded-full bg-yellow-100 p-2 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Đơn hàng mới nhất</p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(orders[0].createdAt), 'dd/MM/yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
