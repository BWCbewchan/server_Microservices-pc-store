import React, { useEffect, useState } from "react";
import axios from "axios";


// Base URL for API requests
const ORDER_API_URL = "http://localhost:3000/api/orders";

const OrderEditModal = ({ orderId, onClose, onSave }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    shippingMethod: "",
    shippingFee: 0,
    paymentMethod: "",
    paymentStatus: "pending",
    orderStatus: "pending",
    customerNote: "",
    sellerNote: ""
  });
  const [items, setItems] = useState([]);
  const [removedItems, setRemovedItems] = useState([]);
  const [subTotal, setSubTotal] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  // Fetch order details when component mounts
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${ORDER_API_URL}/${orderId}`);
        const orderData = response.data;
        setOrder(orderData);

        // Initialize form data from order
        setFormData({
          customerName: orderData.customer?.name || "",
          customerEmail: orderData.customer?.email || "",
          customerPhone: orderData.customer?.phone || "",
          customerAddress: orderData.customer?.address || "",
          shippingMethod: orderData.shipping?.method || "",
          shippingFee: orderData.shipping?.fee || 0,
          paymentMethod: orderData.payment?.method || "",
          paymentStatus: orderData.payment?.status || "pending",
          orderStatus: orderData.status || "pending",
          customerNote: orderData.notes?.customerNote || "",
          sellerNote: orderData.notes?.sellerNote || ""
        });

        // Initialize items
        setItems(orderData.items || []);

        // Calculate initial totals
        calculateTotals(orderData.items, orderData.shipping?.fee || 0);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Không thể tải thông tin đơn hàng");
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Calculate order totals
  const calculateTotals = (currentItems, shippingFee) => {
    const itemsSubtotal = currentItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    setSubTotal(itemsSubtotal);
    setFinalTotal(itemsSubtotal + parseFloat(shippingFee));
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const newFormData = {
        ...prev,
        [name]: value
      };

      // If payment status is changed to "paid", suggest updating order status
      if (name === 'paymentStatus' && value === 'paid' && order.status === 'pending') {
        if (window.confirm('Xác nhận thanh toán thành công. Cập nhật trạng thái đơn hàng thành "Đã xác nhận"?')) {
          // Update both payment status and order status
          return {
            ...newFormData,
            orderStatus: 'confirmed'
          };
        }
      }

      // Recalculate totals if shipping fee changes
      if (name === 'shippingFee') {
        calculateTotals(items, value);
      }

      return newFormData;
    });
  };

  // Handle item quantity changes
  const handleItemQuantityChange = (index, newQuantity) => {
    // Ensure quantity is a positive number
    newQuantity = Math.max(1, parseInt(newQuantity) || 1);

    setItems(prevItems => {
      const updatedItems = [...prevItems];
      updatedItems[index].quantity = newQuantity;

      // Recalculate totals
      calculateTotals(updatedItems, formData.shippingFee);

      return updatedItems;
    });
  };

  // Handle item price changes with validation
  const handleItemPriceChange = (index, newPriceInput) => {
    // Get the original item to compare
    const originalItem = order.items.find(item => item._id === items[index]._id) || {};
    const originalPrice = originalItem.price || 0;

    // Convert input to number
    const newPrice = parseFloat(newPriceInput);

    // If the input is valid or unchanged, update the price
    if (!isNaN(newPrice) && newPrice >= 0) {
      setItems(prevItems => {
        const updatedItems = [...prevItems];
        updatedItems[index].price = newPrice;
        calculateTotals(updatedItems, formData.shippingFee);
        return updatedItems;
      });
    }
  };

  // Remove an item
  const handleRemoveItem = (index) => {
    setItems(prevItems => {
      const updatedItems = [...prevItems];
      const removedItem = updatedItems.splice(index, 1)[0];

      // Add to removed items list if it has an ID
      if (removedItem._id) {
        setRemovedItems(prev => [...prev, removedItem._id]);
      }

      // Recalculate totals
      calculateTotals(updatedItems, formData.shippingFee);

      return updatedItems;
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      setError("Đơn hàng phải có ít nhất một sản phẩm");
      return;
    }

    try {
      setSaving(true);

      // Prepare data for update
      const updateData = {
        customer: {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone,
          address: formData.customerAddress
        },
        shipping: {
          ...order.shipping,
          method: formData.shippingMethod,
          fee: parseFloat(formData.shippingFee)
        },
        payment: {
          ...order.payment,
          method: formData.paymentMethod,
          status: formData.paymentStatus  // Add payment status update
        },
        notes: {
          customerNote: formData.customerNote,
          sellerNote: formData.sellerNote
        },
        items: items,
        finalTotal: finalTotal,
        removedItems: removedItems,
        status: formData.orderStatus  // Add order status update
      };

      // Encode update data for URL
      const encodedUpdateData = encodeURIComponent(JSON.stringify(updateData));

      // Send update request
      const response = await axios.put(`${ORDER_API_URL}/update/${orderId}/${encodedUpdateData}`);

      if (response.data) {
        // Update the local order with the response data
        const updatedOrder = {
          ...order,
          customer: updateData.customer,
          shipping: updateData.shipping,
          payment: updateData.payment,
          notes: updateData.notes,
          items: updateData.items,
          finalTotal: updateData.finalTotal,
          status: updateData.status,
          updatedAt: new Date().toISOString()
        };

        // Call the onSave callback with the locally updated order data
        onSave(updatedOrder);

        // Show success message for payment status changes
        if (formData.paymentStatus === 'paid' && order.payment?.status !== 'paid') {
          toast.success("Đã cập nhật trạng thái thanh toán thành công!");
        }
      }
    } catch (err) {
      console.error("Error updating order:", err);
      setError("Không thể cập nhật đơn hàng: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
          <h2 className="text-xl font-bold mb-4">Đang tải thông tin đơn hàng...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
          <h2 className="text-xl font-bold mb-4 text-red-600">{error}</h2>
          <div className="flex justify-end mt-4">
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Chỉnh sửa đơn hàng #{order._id}</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[80vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-semibold mb-2">Thông tin khách hàng</h3>

              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Tên khách hàng</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                <textarea
                  name="customerAddress"
                  value={formData.customerAddress}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Thông tin vận chuyển & thanh toán</h3>

              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Phương thức vận chuyển</label>
                <select
                  name="shippingMethod"
                  value={formData.shippingMethod}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="standard">Tiêu chuẩn</option>
                  <option value="express">Nhanh</option>
                </select>
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Phí vận chuyển</label>
                <input
                  type="number"
                  name="shippingFee"
                  value={formData.shippingFee}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Phương thức thanh toán</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="cod">Thanh toán khi nhận hàng (COD)</option>
                  <option value="bank">Chuyển khoản ngân hàng</option>
                </select>
              </div>

              {/* Add payment status field */}
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Trạng thái thanh toán</label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="pending">Chờ thanh toán</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="failed">Thanh toán thất bại</option>
                </select>
              </div>

              {/* Add order status field */}
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Trạng thái đơn hàng</label>
                <select
                  name="orderStatus"
                  value={formData.orderStatus}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              {/* Payment status notice for bank transfers */}
              {formData.paymentMethod === 'bank' && formData.paymentStatus === 'pending' && (
                <div className="mb-4 mt-2 bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                  <p className="font-medium">Lưu ý: Đơn hàng thanh toán chuyển khoản</p>
                  <p>Sau khi xác nhận khách hàng đã thanh toán, vui lòng cập nhật trạng thái thanh toán thành "Đã thanh toán".</p>
                </div>
              )}

              {formData.paymentMethod === 'bank' && formData.paymentStatus === 'paid' && (
                <div className="mb-4 mt-2 bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
                  <p className="font-medium">Đã xác nhận thanh toán</p>
                  <p>Khách hàng đã thanh toán đơn hàng này.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Ghi chú</h3>

            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Ghi chú của khách hàng</label>
              <textarea
                name="customerNote"
                value={formData.customerNote}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                rows="2"
              ></textarea>
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Ghi chú của người bán</label>
              <textarea
                name="sellerNote"
                value={formData.sellerNote}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                rows="2"
              ></textarea>
            </div>
          </div>

          {/* Products list - editable */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Sản phẩm</h3>
            <div className="border rounded overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-2/5">Sản phẩm</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/5">Giá</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/5">Số lượng</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/5">Tổng</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-3 py-3 whitespace-normal">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[index].name = e.target.value;
                            setItems(newItems);
                          }}
                          className="w-full border rounded px-2 py-1"
                        />
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleItemPriceChange(index, e.target.value)}
                          className="w-full border rounded px-2 py-1"
                          min="0"
                          data-original-value={
                            order.items.find(orderItem => orderItem._id === item._id)?.price || 0
                          }
                        />
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemQuantityChange(index, e.target.value)}
                          className="w-full border rounded px-2 py-1"
                          min="1"
                        />
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {(item.price * item.quantity).toLocaleString()} đ
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-3 py-3 text-right font-medium">Tổng tiền hàng:</td>
                    <td className="px-3 py-3 font-medium">{subTotal.toLocaleString()} đ</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="px-3 py-3 text-right font-medium">Phí vận chuyển:</td>
                    <td className="px-3 py-3 font-medium">{parseFloat(formData.shippingFee).toLocaleString()} đ</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="px-3 py-3 text-right font-medium">Tổng thanh toán:</td>
                    <td className="px-3 py-3 font-bold text-red-600">{finalTotal.toLocaleString()} đ</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Show error message if any */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={onClose}
              disabled={saving}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderEditModal;
