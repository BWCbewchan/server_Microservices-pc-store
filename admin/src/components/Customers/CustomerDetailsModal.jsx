import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";

// Update to use the correct API endpoint
const USER_API_URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/auth/users`; // Correct endpoint

export default function CustomerDetailsModal({ userId, onClose, onUserUpdate }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("info"); // 'info', 'orders', 'activity'
  const [editMode, setEditMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);

  // Fetch customer data
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        console.log(`Fetching customer details for ID: ${userId}`);

        const customerResponse = await axios.get(`${USER_API_URL}/${userId}`);
        console.log("Customer data response:", customerResponse.data);
        setCustomer(customerResponse.data);
        setSelectedRole(customerResponse.data.role || "user");
        setError(null);
      } catch (err) {
        console.error("Error fetching customer data:", err);
        setError("Không thể tải thông tin khách hàng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [userId]);

  // Handle role update
  const handleRoleUpdate = async () => {
    if (!customer || selectedRole === customer.role) {
      return; // No change or no customer
    }

    try {
      setUpdating(true);
      setUpdateMessage(null);

      // Get token from localStorage
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setUpdateMessage({ type: "error", text: "Authentication required. Please log in again." });
        setUpdating(false);
        return;
      }

      // Call API to update user role
      const response = await axios.put(
        `${USER_API_URL}/${userId}`,
        { role: selectedRole },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update local state
      setCustomer(prev => ({ ...prev, role: selectedRole }));
      setEditMode(false);
      setUpdateMessage({ type: "success", text: "Role updated successfully" });

      // Notify parent component
      if (onUserUpdate) {
        onUserUpdate({ ...customer, role: selectedRole });
      }
    } catch (error) {
      console.error("Failed to update role:", error);
      setUpdateMessage({ type: "error", text: "Failed to update role. Please try again." });
    } finally {
      setUpdating(false);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setSelectedRole(customer?.role || "user");
    setEditMode(false);
  };

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
                  className="py-3 px-4 border-b-2 border-blue-500 text-blue-600 font-medium text-sm"
                  onClick={() => setActiveTab("info")}
                >
                  Thông tin cá nhân
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === "info" && (
                <div className="space-y-8">
                  {/* Update Message */}
                  {updateMessage && (
                    <div className={`p-3 rounded-md ${updateMessage.type === "success"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                      }`}>
                      {updateMessage.text}
                    </div>
                  )}

                  {/* Customer Overview */}
                  <div className="flex items-start justify-between">
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
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${customer?.role === 'admin'
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                            }`}>
                            {customer?.role === 'admin' ? 'Admin' : 'Người dùng'}
                          </span>
                          <span className="ml-2 text-gray-500">
                            Tham gia: {customer?.createdAt ? format(new Date(customer.createdAt), 'dd/MM/yyyy') : 'N/A'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Edit Role Button */}
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      disabled={editMode}
                    >
                      Sửa vai trò
                    </button>
                  </div>

                  {/* Role Edit Section */}
                  {editMode && (
                    <div className="bg-gray-50 p-4 rounded-md border">
                      <h4 className="font-medium mb-3">Thay đổi vai trò người dùng</h4>
                      <div className="flex items-center gap-3 mb-4">
                        <label className="text-sm font-medium">Vai trò:</label>
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="border rounded py-1 px-2"
                          disabled={updating}
                        >
                          <option value="user">Người dùng</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleRoleUpdate}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                          disabled={updating || selectedRole === customer?.role}
                        >
                          {updating ? "Đang cập nhật..." : "Lưu"}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                          disabled={updating}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}

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
                        <p className="text-sm text-gray-500">Vai trò</p>
                        <p>{customer?.role === 'admin' ? 'Admin' : 'Người dùng'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  {customer?.address && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Địa chỉ</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {customer.address.street && (
                          <div>
                            <p className="text-sm text-gray-500">Đường</p>
                            <p>{customer.address.street}</p>
                          </div>
                        )}
                        {customer.address.city && (
                          <div>
                            <p className="text-sm text-gray-500">Thành phố</p>
                            <p>{customer.address.city}</p>
                          </div>
                        )}
                        {customer.address.state && (
                          <div>
                            <p className="text-sm text-gray-500">Tiểu bang/Tỉnh</p>
                            <p>{customer.address.state}</p>
                          </div>
                        )}
                        {customer.address.zipCode && (
                          <div>
                            <p className="text-sm text-gray-500">Mã bưu điện</p>
                            <p>{customer.address.zipCode}</p>
                          </div>
                        )}
                        {customer.address.country && (
                          <div>
                            <p className="text-sm text-gray-500">Quốc gia</p>
                            <p>{customer.address.country}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
