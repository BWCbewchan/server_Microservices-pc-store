import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ORDER_API_URL = "http://localhost:3000/api/orders";
const INVENTORY_API = "http://localhost:3000/api/inventory";
const CART_API_URL = "http://localhost:3000/api/cart";

const CheckoutForm = ({ selectedItems, shippingMethod, setShippingMethod, subtotal, finalTotal }) => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [customerNote, setCustomerNote] = useState("");

  const handleOrderSubmit = async () => {
    // Validate
    if (!firstName || !lastName || !address || !phone || !email) {
      toast.error("Vui lòng nhập đầy đủ thông tin khách hàng.");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Giỏ hàng trống.");
      return;
    }

    const userId = "64e65e8d3d5e2b0c8a3e9f12";
    const customer = { name: `${firstName} ${lastName}`, address, phone, email };
    const items = selectedItems.map(i => ({
      productId: i.productId, name: i.name, quantity: i.quantity, price: i.price
    }));
    const shipping = {
      method: shippingMethod,
      fee: shippingMethod === "standard" ? 30000 : 50000,
      status: "processing", trackingNumber: ""
    };
    const payment = { method: paymentMethod, status: "pending" };
    const notes = { customerNote, sellerNote: "" };

    try {
      // 1) Check tồn kho
      const idsParam = items.map(i => i.productId).join(",");
      const { data: inv } = await axios.get(`${INVENTORY_API}/bulk/${idsParam}`);
      for (let it of items) {
        const stockItem = inv.find(x => x.productId === it.productId);
        if (!stockItem || stockItem.stock < it.quantity) {
          toast.error(`Sản phẩm ${it.name} không đủ hàng`);
          return;
        }
      }

      // 2) Tạo order trước
      const createUrl = `${ORDER_API_URL}/create/${userId}` +
        `/${encodeURIComponent(JSON.stringify(customer))}` +
        `/${encodeURIComponent(JSON.stringify(items))}` +
        `/${encodeURIComponent(JSON.stringify(shipping))}` +
        `/${encodeURIComponent(JSON.stringify(payment))}` +
        `/${finalTotal}` +
        `/${encodeURIComponent(JSON.stringify(notes))}`;
      const orderResp = await axios.post(createUrl);
      const orderId = orderResp.data.order._id;

      // 3) Nếu chọn bank (Momo) → gọi service payment qua params
      if (paymentMethod === "bank") {
        const params = {
          amount: finalTotal.toString(),
          orderInfo: `Thanh toán đơn ${orderId}`,
          orderId,
          requestId: orderId,
          extraData: ""
        };
        const payResp = await axios.get("http://localhost:3000/api/payment/payment", { params });
        if (payResp.data.payUrl) {
          localStorage.setItem("pendingOrderId", orderId);
          window.location.href = payResp.data.payUrl;
          return;
        } else {
          toast.error("Không thể tạo URL thanh toán");
          return;
        }
      }

      // 4) Nếu COD hoặc khác → hoàn tất, xóa cart
      toast.success("Đặt hàng thành công!");
      navigate("/home", { state: { order: orderResp.data.order } });
      await axios.delete(`${CART_API_URL}/clear/${userId}`);

    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error("Lỗi khi xử lý đơn hàng: " + msg);
      console.error(err);
    }
  };

 
  return (
    <form
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "565px",
        gap: "26px",
        color: "#C94D3F",
        fontWeight: "600",
        fontSize: "13px",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h2 style={{ color: "#000", fontSize: "18px" }}>Shipping Address</h2>

      {/* Email */}
      <div>
        <label htmlFor="email" style={{ lineHeight: "2.1" }}>
          Email Address <span style={{ color: "#C94D3F" }}>*</span>
        </label>
        <input
          type="email"
          id="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            borderRadius: "4px",
            border: "1px solid #A2A6B0",
            backgroundColor: "#FFF",
            width: "100%",
            height: "50px",
          }}
          aria-label="Email Address"
        />
      </div>

      {/* First Name */}
      <div>
        <label htmlFor="first-name" style={{ lineHeight: "2.1" }}>
          First Name <span style={{ color: "#C94D3F" }}>*</span>
        </label>
        <input
          type="text"
          id="first-name"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={{
            borderRadius: "4px",
            border: "1px solid #A2A6B0",
            backgroundColor: "#FFF",
            width: "100%",
            height: "50px",
          }}
          aria-label="First Name"
        />
      </div>

      {/* Last Name */}
      <div>
        <label htmlFor="last-name" style={{ lineHeight: "2.1" }}>
          Last Name <span style={{ color: "#C94D3F" }}>*</span>
        </label>
        <input
          type="text"
          id="last-name"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          style={{
            borderRadius: "4px",
            border: "1px solid #A2A6B0",
            backgroundColor: "#FFF",
            width: "100%",
            height: "50px",
          }}
          aria-label="Last Name"
        />
      </div>

      {/* Street Address */}
      <div>
        <label htmlFor="address" style={{ lineHeight: "2.1" }}>
          Street Address <span style={{ color: "#C94D3F" }}>*</span>
        </label>
        <input
          type="text"
          id="address"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{
            borderRadius: "4px",
            border: "1px solid #A2A6B0",
            backgroundColor: "#FFF",
            width: "100%",
            height: "50px",
          }}
          aria-label="Street Address"
        />
        <input
          type="text"
          style={{
            borderRadius: "4px",
            border: "1px solid #A2A6B0",
            backgroundColor: "#FFF",
            width: "100%",
            height: "50px",
            marginTop: "11px",
          }}
          placeholder="Additional Street Address"
          aria-label="Additional Street Address"
        />
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phone" style={{ lineHeight: "2.1" }}>
          Phone Number <span style={{ color: "#C94D3F" }}>*</span>
        </label>
        <input
          type="tel"
          id="phone"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{
            borderRadius: "4px",
            border: "1px solid #A2A6B0",
            backgroundColor: "#FFF",
            width: "100%",
            height: "50px",
          }}
          aria-label="Phone Number"
        />
      </div>

      <h2 style={{ color: "#000", fontSize: "18px" }}>Shipping & Payment</h2>

      {/* Shipping Method */}
      <div style={{ marginBottom: "11px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>
          Shipping Method <span style={{ color: "#C94D3F" }}>*</span>
        </label>
        <select
          value={shippingMethod}
          onChange={(e) => setShippingMethod(e.target.value)}
          style={{
            borderRadius: "4px",
            border: "1px solid #A2A6B0",
            backgroundColor: "#FFF",
            width: "100%",
            height: "50px",
          }}
        >
          <option value="standard">Standard (30,000 VND)</option>
          <option value="express">Express (50,000 VND)</option>
        </select>
      </div>

      {/* Payment Method */}
      <div style={{ marginBottom: "11px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>
          Payment Method <span style={{ color: "#C94D3F" }}>*</span>
        </label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          style={{
            borderRadius: "4px",
            border: "1px solid #A2A6B0",
            backgroundColor: "#FFF",
            width: "100%",
            height: "50px",
          }}
        >
          <option value="cod">Cash on Delivery</option>
          
          <option value="bank">Bank Transfer</option>
        </select>
      </div>

      {/* Order Note */}
      <div>
        <label style={{ display: "block", marginBottom: "5px" }}>
          Order Note (optional)
        </label>
        <textarea
          id="customerNote"
          name="customerNote"
          value={customerNote}
          onChange={(e) => setCustomerNote(e.target.value)}
          placeholder="Your note..."
          style={{
            borderRadius: "4px",
            border: "1px solid #A2A6B0",
            width: "100%",
            height: "80px",
          }}
        ></textarea>
      </div>

      {/* Confirm Order Button */}
      <button
        type="button"
        onClick={handleOrderSubmit}
        style={{
          backgroundColor: "#C94D3F",
          color: "#FFF",
          borderRadius: "4px",
          border: "none",
          height: "50px",
          fontWeight: "600",
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        Confirm Order
      </button>
    </form>
  );
};

export default CheckoutForm;
