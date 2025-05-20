import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Define API endpoints with fallbacks
const API_GATEWAY_URL = import.meta.env.VITE_APP_API_GATEWAY_URL || "http://localhost:3000";
const ORDER_API_URL = `${API_GATEWAY_URL}/api/orders`;
const DIRECT_ORDER_API_URL = "http://localhost:4009";
const INVENTORY_API = `${API_GATEWAY_URL}/api/inventory`;
const DIRECT_INVENTORY_API = "http://localhost:4000";
const CART_API_URL = `${API_GATEWAY_URL}/api/cart`;

const CheckoutForm = ({ selectedItems, shippingMethod, setShippingMethod, subtotal, finalTotal, currentUser }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    email: "",
    paymentMethod: "cod",
    customerNote: ""
  });
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [serviceStatus, setServiceStatus] = useState({
    apiGateway: false,
    orderService: false
  });

  // Check services status on component mount
  useEffect(() => {
    const checkServices = async () => {
      try {
        // Check API gateway
        try {
          await axios.get(`${API_GATEWAY_URL}/api-status`, { timeout: 2000 });
          setServiceStatus(prev => ({ ...prev, apiGateway: true }));
          console.log("API Gateway is accessible");
        } catch (err) {
          console.warn("API Gateway check failed:", err.message);
          setServiceStatus(prev => ({ ...prev, apiGateway: false }));
        }

        // Check order service directly
        try {
          await axios.get(`${DIRECT_ORDER_API_URL}/ping`, { timeout: 2000 });
          setServiceStatus(prev => ({ ...prev, orderService: true }));
          console.log("Order service is accessible directly");
        } catch (err) {
          console.warn("Order service direct check failed:", err.message);
          setServiceStatus(prev => ({ ...prev, orderService: false }));
        }
      } catch (error) {
        console.error("Service check error:", error);
      }
    };

    checkServices();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleOrderSubmit = async () => {
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.address || !formData.phone || !formData.email) {
      toast.error("Vui lòng nhập đầy đủ thông tin khách hàng.");
      setValidated(true);
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Giỏ hàng trống.");
      return;
    }

    // Enhanced authentication check that also looks at localStorage
    let userId = null;

    // First check if we have currentUser from context
    if (currentUser) {
      userId = currentUser.id || currentUser._id;
    }

    // If not found in context, try localStorage
    if (!userId) {
      try {
        const storedUserData = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          userId = userData.id || userData._id;
          console.log("Using user ID from localStorage:", userId);
        }
      } catch (err) {
        console.error("Error parsing stored user data:", err);
      }
    }

    // If still no userId, prompt login
    if (!userId) {
      toast.error("Vui lòng đăng nhập để tiếp tục.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      console.log("Creating order with userId:", userId);

      const customer = {
        name: `${formData.firstName} ${formData.lastName}`,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
      };

      const items = selectedItems.map((i) => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      }));

      const shipping = {
        method: shippingMethod,
        fee: shippingMethod === "standard" ? 30000 : 50000,
        status: "processing",
        trackingNumber: "",
      };

      const payment = { method: formData.paymentMethod, status: "pending" };
      const notes = { customerNote: formData.customerNote, sellerNote: "" };

      // 1) Check inventory first
      let inventoryData;
      try {
        // Try API Gateway first
        const idsParam = items.map((i) => i.productId).join(",");
        const inventoryResponse = await axios.get(`${INVENTORY_API}/bulk/${idsParam}`, { timeout: 5000 });
        inventoryData = inventoryResponse.data;
      } catch (invErr) {
        console.warn("Failed to check inventory via API Gateway:", invErr.message);
        
        // Try direct connection as fallback
        try {
          const idsParam = items.map((i) => i.productId).join(",");
          const directInventoryResponse = await axios.get(`${DIRECT_INVENTORY_API}/bulk/${idsParam}`, { timeout: 5000 });
          inventoryData = directInventoryResponse.data;
        } catch (directInvErr) {
          console.error("All inventory check attempts failed");
          throw new Error("Không thể kiểm tra tồn kho. Vui lòng thử lại sau.");
        }
      }

      // Check if any items are out of stock
      for (let it of items) {
        const stockItem = inventoryData.find((x) => x.productId === it.productId);
        if (!stockItem || stockItem.stock < it.quantity) {
          toast.error(`Sản phẩm ${it.name} không đủ hàng`);
          setLoading(false);
          return;
        }
      }

      // 2) Create order with multiple approaches
      const orderData = {
        userId,
        customer,
        items,
        shipping,
        payment,
        finalTotal,
        notes,
      };

      console.log("Sending order data:", JSON.stringify(orderData));
      
      // Try multiple approaches to create the order
      let orderResp;
      let successfulMethod = null;
      
      // Method 1: API Gateway with JSON body
      if (!orderResp && serviceStatus.apiGateway) {
        try {
          console.log("Attempting order creation via API Gateway with JSON body");
          orderResp = await axios.post(`${ORDER_API_URL}/create`, orderData, {
            headers: { "Content-Type": "application/json" },
            timeout: 8000,
          });
          successfulMethod = "API Gateway JSON";
        } catch (err) {
          console.warn("API Gateway order creation with JSON body failed:", err.message);
        }
      }
      
      // Method 2: Direct to order service with JSON body
      if (!orderResp && serviceStatus.orderService) {
        try {
          console.log("Attempting order creation via direct connection with JSON body");
          orderResp = await axios.post(`${DIRECT_ORDER_API_URL}/create`, orderData, {
            headers: { "Content-Type": "application/json" },
            timeout: 8000,
          });
          successfulMethod = "Direct JSON";
        } catch (err) {
          console.warn("Direct order service with JSON body failed:", err.message);
        }
      }
      
      // Method 3: API Gateway with URL parameters (legacy approach)
      if (!orderResp && serviceStatus.apiGateway) {
        try {
          console.log("Attempting order creation via API Gateway with URL parameters");
          const customerParam = encodeURIComponent(JSON.stringify(customer));
          const itemsParam = encodeURIComponent(JSON.stringify(items));
          const shippingParam = encodeURIComponent(JSON.stringify(shipping));
          const paymentParam = encodeURIComponent(JSON.stringify(payment));
          const notesParam = encodeURIComponent(JSON.stringify(notes));
          
          const url = `${ORDER_API_URL}/create/${userId}/${customerParam}/${itemsParam}/${shippingParam}/${paymentParam}/${finalTotal}/${notesParam}`;
          console.log("Legacy URL (truncated):", url.substring(0, 100) + "...");
          
          orderResp = await axios.post(url, null, { timeout: 10000 });
          successfulMethod = "API Gateway URL params";
        } catch (err) {
          console.warn("API Gateway with URL parameters failed:", err.message);
        }
      }
      
      // Method 4: Direct to order service with URL parameters (most compatible)
      if (!orderResp) {
        try {
          console.log("Last resort: Attempting direct order creation with URL parameters");
          const customerParam = encodeURIComponent(JSON.stringify(customer));
          const itemsParam = encodeURIComponent(JSON.stringify(items));
          const shippingParam = encodeURIComponent(JSON.stringify(shipping));
          const paymentParam = encodeURIComponent(JSON.stringify(payment));
          const notesParam = encodeURIComponent(JSON.stringify(notes));
          
          const url = `${DIRECT_ORDER_API_URL}/create/${userId}/${customerParam}/${itemsParam}/${shippingParam}/${paymentParam}/${finalTotal}/${notesParam}`;
          
          orderResp = await axios.post(url, null, { timeout: 10000 });
          successfulMethod = "Direct URL params";
        } catch (err) {
          console.error("All order creation attempts failed:", err);
          throw new Error("Không thể kết nối đến máy chủ đơn hàng. Vui lòng thử lại sau.");
        }
      }

      console.log(`Order created successfully using ${successfulMethod}:`, orderResp.data);
      
      // Verify the user ID in the response
      if (orderResp.data.order && orderResp.data.order.userId !== userId) {
        console.warn(`User ID mismatch: sent ${userId} but received ${orderResp.data.order.userId}`);
      }

      // 3) Handle payment methods
      if (formData.paymentMethod === "bank") {
        // Payment handling code for bank transfers
        // ...existing code...
      }

      // 4) Complete checkout process
      toast.success("Đặt hàng thành công!");
      
      // Clear cart (improved with better error handling)
      try {
        console.log("Attempting to clear cart after order creation");
        // First try clearing the entire cart
        await axios.delete(`${CART_API_URL}/clear/${userId}`, { timeout: 5000 });
      } catch (clearError) {
        console.warn("Failed to clear entire cart:", clearError.message);
        
        // Fallback: Try removing individual items
        try {
          for (let item of items) {
            try {
              await axios.delete(`${CART_API_URL}/remove/${userId}/${item.productId}`, { timeout: 3000 });
            } catch (removeError) {
              console.warn(`Failed to remove item ${item.productId}:`, removeError.message);
            }
          }
        } catch (itemError) {
          console.warn("Error during individual item removal:", itemError.message);
        }
      }
      
      // Still navigate to home even if cart clearing failed
      navigate("/home", { state: { order: orderResp.data.order } });
    } catch (err) {
      console.error("Order creation error:", err);
      const msg = err.response?.data?.message || err.message;
      toast.error("Lỗi khi xử lý đơn hàng: " + msg);
    } finally {
      setLoading(false);
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
          value={formData.email}
          onChange={handleInputChange}
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
        <label htmlFor="firstName" style={{ lineHeight: "2.1" }}>
          First Name <span style={{ color: "#C94D3F" }}>*</span>
        </label>
        <input
          type="text"
          id="firstName"
          required
          value={formData.firstName}
          onChange={handleInputChange}
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
        <label htmlFor="lastName" style={{ lineHeight: "2.1" }}>
          Last Name <span style={{ color: "#C94D3F" }}>*</span>
        </label>
        <input
          type="text"
          id="lastName"
          required
          value={formData.lastName}
          onChange={handleInputChange}
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
          value={formData.address}
          onChange={handleInputChange}
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
          value={formData.phone}
          onChange={handleInputChange}
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
          id="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleInputChange}
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
          value={formData.customerNote}
          onChange={handleInputChange}
          placeholder="Your note..."
          style={{
            borderRadius: "4px",
            border: "1px solid #A2A6B0",
            width: "100%",
            height: "80px",
          }}
        ></textarea>
      </div>

      {/* Service status warning if services are down */}
      {(!serviceStatus.apiGateway && !serviceStatus.orderService) && (
        <div style={{ 
          backgroundColor: "#FFF3CD", 
          padding: "10px 15px", 
          borderRadius: "4px", 
          color: "#856404", 
          fontSize: "14px"
        }}>
          <p style={{ margin: 0 }}>
            <strong>Warning:</strong> Order services appear to be offline. 
            We'll still try to process your order, but there might be delays.
          </p>
        </div>
      )}

      {/* Confirm Order Button */}
      <button
        type="button"
        onClick={handleOrderSubmit}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#D9A191" : "#C94D3F",
          color: "#FFF",
          borderRadius: "4px",
          border: "none",
          height: "50px",
          fontWeight: "600",
          fontSize: "14px",
          cursor: loading ? "not-allowed" : "pointer",
          position: "relative",
        }}
      >
        {loading ? (
          <>
            <span style={{ 
              display: "inline-block", 
              width: "20px", 
              height: "20px", 
              border: "3px solid rgba(255,255,255,.3)", 
              borderRadius: "50%", 
              borderTopColor: "#fff", 
              animation: "spin 1s ease-in-out infinite", 
              marginRight: "8px",
              verticalAlign: "middle" 
            }}></span>
            Đang xử lý...
          </>
        ) : "Confirm Order"}
      </button>

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </form>
  );
};

export default CheckoutForm;
