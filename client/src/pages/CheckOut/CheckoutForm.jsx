import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";

// Define API endpoints with fallbacks
const API_GATEWAY_URL = import.meta.env.VITE_APP_API_GATEWAY_URL || "http://localhost:3000";
const ORDER_API_URL = `${API_GATEWAY_URL}/api/orders`;
const DIRECT_ORDER_API_URL = "http://localhost:4009";
const INVENTORY_API = `${API_GATEWAY_URL}/api/inventory`;
const DIRECT_INVENTORY_API = "http://localhost:4000";
const CART_API_URL = `${API_GATEWAY_URL}/api/cart`;

const CheckoutForm = ({ selectedItems, shippingMethod, setShippingMethod, subtotal, finalTotal }) => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  
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

  // Load user data when component mounts
  useEffect(() => {
    // Get user from context or localStorage
    let user = currentUser;
    
    if (!user) {
      try {
        const storedUserData = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (storedUserData) {
          user = JSON.parse(storedUserData);
          console.log("Using user data from localStorage:", user.email);
        }
      } catch (err) {
        console.error("Error parsing stored user data:", err);
      }
    }
    
    if (user) {
      // Pre-fill the form with user data
      let firstName = "", lastName = "";
      
      // Extract first and last name if user.name exists
      if (user.name) {
        const nameParts = user.name.split(' ');
        if (nameParts.length > 1) {
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ');
        } else {
          firstName = user.name;
        }
      }
      
      setFormData(prevData => ({
        ...prevData,
        firstName,
        lastName,
        email: user.email || "",
        phone: user.phone || "",
        address: user.address?.street || user.address?.full || "",
      }));
      
      console.log("Pre-filled checkout form with user data");
    }
    
    // Check services status 
    checkServices();
  }, [currentUser]);

  // Check services status
  const checkServices = async () => {
    try {
      // Check API gateway
      try {
        await axios.get(`${API_GATEWAY_URL}/api-status`, { timeout: 2000 });
        setServiceStatus(prev => ({ ...prev, apiGateway: true }));
      } catch (err) {
        console.warn("API Gateway check failed:", err.message);
      }

      // Check order service directly
      try {
        await axios.get(`${DIRECT_ORDER_API_URL}/ping`, { timeout: 2000 });
        setServiceStatus(prev => ({ ...prev, orderService: true }));
      } catch (err) {
        console.warn("Order service direct check failed:", err.message);
      }
    } catch (error) {
      console.error("Service check error:", error);
    }
  };

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

      // 4) Improved cart clearing - moved before navigation and made more robust
      toast.success("Đặt hàng thành công!");
      
      // Store the new order in localStorage before clearing cart
      localStorage.setItem('lastOrder', JSON.stringify(orderResp.data.order));
        
      // Enhanced cart clearing mechanism with multiple fallbacks
      console.log("Beginning cart clearing process for userId:", userId);
      let cartCleared = false;
      
      // Method 1: Clear entire cart through API Gateway
      try {
        console.log("Attempting to clear cart via API Gateway");
        await axios.delete(`${CART_API_URL}/clear/${userId}`, { timeout: 8000 });
        console.log("Cart successfully cleared via API Gateway");
        cartCleared = true;
      } catch (clearError) {
        console.warn("Failed to clear cart via API Gateway:", clearError.message);
        
        // Method 2: Try direct connection to cart service
        try {
          console.log("Attempting to clear cart via direct connection");
          await axios.delete(`http://localhost:4005/clear/${userId}`, { timeout: 8000 });
          console.log("Cart successfully cleared via direct connection");
          cartCleared = true;
        } catch (directError) {
          console.warn("Failed to clear cart via direct connection:", directError.message);
          
          // Method 3: Try removing individual items one by one
          try {
            console.log("Attempting to remove cart items individually");
            const removePromises = items.map(item => 
              axios.delete(`${CART_API_URL}/remove/${userId}/${item.productId}`, { timeout: 3000 })
                .catch(e => console.warn(`Failed to remove item ${item.productId}:`, e.message))
            );
            
            await Promise.allSettled(removePromises);
            console.log("Completed individual item removal attempts");
            
            // Method 4: Try an alternative API endpoint format if available
            try {
              console.log("Attempting alternative cart clear format");
              await axios.post(`${CART_API_URL}/empty`, { userId }, { timeout: 5000 });
              console.log("Cart cleared via alternative endpoint");
              cartCleared = true;
            } catch (altError) {
              console.warn("Alternative cart clear failed:", altError.message);
            }
          } catch (itemError) {
            console.warn("Error during individual item removal:", itemError.message);
          }
        }
      }
      
      // Method 5: Client-side cart reset (use context if available)
      if (!cartCleared) {
        console.log("All API cart clearing methods failed, attempting client-side reset");
        
        // Try to find cart reset functions in window/global scope
        if (window.resetCart) {
          window.resetCart();
          console.log("Called global resetCart function");
        }
        
        // Clear cart data from localStorage as last resort
        try {
          localStorage.removeItem('cart');
          localStorage.removeItem('cartItems');
          sessionStorage.removeItem('cart');
          sessionStorage.removeItem('cartItems');
          console.log("Removed cart data from local/session storage");
        } catch (storageError) {
          console.error("Failed to clear cart from storage:", storageError);
        }
      }
      
      // Introduce a small delay to ensure cart clearing operations complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Navigate to order confirmation page instead of home
      navigate("/order-confirmation", { 
        state: { 
          order: orderResp.data.order,
          cartCleared: cartCleared 
        },
        replace: true // Use replace to prevent back navigation to checkout
      });
    } catch (err) {
      console.error("Order creation error:", err);
      const msg = err.response?.data?.message || err.message;
      toast.error("Lỗi khi xử lý đơn hàng: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-form-container">
      <form
        className="checkout-form"
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          maxWidth: "600px",
          gap: "20px",
          margin: "0 auto",
          padding: "30px",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          borderRadius: "12px",
          color: "#333333",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <h2 className="form-section-title" style={{ 
          color: "#0F172A", 
          fontSize: "22px", 
          fontWeight: "600",
          marginBottom: "10px",
          position: "relative",
          paddingBottom: "10px"
        }}>
          Thông tin người nhận
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "60px",
            height: "3px",
            backgroundColor: "#C94D3F",
            borderRadius: "2px"
          }}></div>
        </h2>

        <div className="form-row" style={{ display: "flex", gap: "15px" }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="firstName" style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "500", 
              fontSize: "14px",
              color: "#4B5563" 
            }}>
              Họ <span style={{ color: "#C94D3F" }}>*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              style={{
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                backgroundColor: "#FFF",
                width: "100%",
                height: "45px",
                padding: "0 15px",
                fontSize: "14px",
                transition: "border-color 0.2s",
                outline: "none",
              }}
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="lastName" style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "500", 
              fontSize: "14px",
              color: "#4B5563" 
            }}>
              Tên <span style={{ color: "#C94D3F" }}>*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              style={{
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                backgroundColor: "#FFF",
                width: "100%",
                height: "45px",
                padding: "0 15px",
                fontSize: "14px",
                transition: "border-color 0.2s",
                outline: "none",
              }}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email" style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontWeight: "500", 
            fontSize: "14px",
            color: "#4B5563" 
          }}>
            Email <span style={{ color: "#C94D3F" }}>*</span>
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            style={{
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              backgroundColor: "#FFF",
              width: "100%",
              height: "45px",
              padding: "0 15px",
              fontSize: "14px",
              transition: "border-color 0.2s",
              outline: "none",
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone" style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontWeight: "500", 
            fontSize: "14px",
            color: "#4B5563" 
          }}>
            Số điện thoại <span style={{ color: "#C94D3F" }}>*</span>
          </label>
          <input
            type="tel"
            className="form-control"
            id="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            style={{
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              backgroundColor: "#FFF",
              width: "100%",
              height: "45px",
              padding: "0 15px",
              fontSize: "14px",
              transition: "border-color 0.2s",
              outline: "none",
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="address" style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontWeight: "500", 
            fontSize: "14px",
            color: "#4B5563" 
          }}>
            Địa chỉ nhận hàng <span style={{ color: "#C94D3F" }}>*</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            style={{
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              backgroundColor: "#FFF",
              width: "100%",
              height: "45px",
              padding: "0 15px",
              fontSize: "14px",
              transition: "border-color 0.2s",
              outline: "none",
            }}
          />
        </div>

        <h2 className="form-section-title" style={{ 
          color: "#0F172A", 
          fontSize: "22px", 
          fontWeight: "600",
          marginTop: "10px",
          marginBottom: "10px",
          position: "relative",
          paddingBottom: "10px"
        }}>
          Phương thức vận chuyển & Thanh toán
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "60px",
            height: "3px",
            backgroundColor: "#C94D3F",
            borderRadius: "2px"
          }}></div>
        </h2>

        <div className="form-group">
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontWeight: "500", 
            fontSize: "14px",
            color: "#4B5563" 
          }}>
            Phương thức vận chuyển <span style={{ color: "#C94D3F" }}>*</span>
          </label>
          <div className="shipping-methods" style={{ display: "flex", gap: "15px" }}>
            <div 
              className={`shipping-option ${shippingMethod === "standard" ? "selected" : ""}`}
              onClick={() => setShippingMethod("standard")}
              style={{
                flex: 1,
                padding: "15px",
                border: `2px solid ${shippingMethod === "standard" ? "#C94D3F" : "#E5E7EB"}`,
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s",
                backgroundColor: shippingMethod === "standard" ? "#FFF6F5" : "#FFF",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: "600", marginBottom: "5px" }}>Tiêu chuẩn</div>
                  <div style={{ fontSize: "13px", color: "#6B7280" }}>2-3 ngày</div>
                </div>
                <div style={{ fontWeight: "600", color: "#C94D3F" }}>30.000đ</div>
              </div>
            </div>
            <div 
              className={`shipping-option ${shippingMethod === "express" ? "selected" : ""}`}
              onClick={() => setShippingMethod("express")}
              style={{
                flex: 1,
                padding: "15px",
                border: `2px solid ${shippingMethod === "express" ? "#C94D3F" : "#E5E7EB"}`,
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s",
                backgroundColor: shippingMethod === "express" ? "#FFF6F5" : "#FFF",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: "600", marginBottom: "5px" }}>Hỏa tốc</div>
                  <div style={{ fontSize: "13px", color: "#6B7280" }}>1-2 ngày</div>
                </div>
                <div style={{ fontWeight: "600", color: "#C94D3F" }}>50.000đ</div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="paymentMethod" style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontWeight: "500", 
            fontSize: "14px",
            color: "#4B5563" 
          }}>
            Phương thức thanh toán <span style={{ color: "#C94D3F" }}>*</span>
          </label>
          <div className="payment-methods" style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
            <div 
              className={`payment-option ${formData.paymentMethod === "cod" ? "selected" : ""}`}
              onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "cod" }))}
              style={{
                padding: "15px",
                border: `2px solid ${formData.paymentMethod === "cod" ? "#C94D3F" : "#E5E7EB"}`,
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s",
                backgroundColor: formData.paymentMethod === "cod" ? "#FFF6F5" : "#FFF",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div style={{ 
                width: "20px", 
                height: "20px", 
                borderRadius: "50%", 
                border: `2px solid ${formData.paymentMethod === "cod" ? "#C94D3F" : "#E5E7EB"}`,
                marginRight: "15px",
                position: "relative"
              }}>
                {formData.paymentMethod === "cod" && (
                  <div style={{ 
                    position: "absolute",
                    top: "3px",
                    left: "3px",
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#C94D3F"
                  }}></div>
                )}
              </div>
              <div>
                <div style={{ fontWeight: "600" }}>Thanh toán khi nhận hàng (COD)</div>
                <div style={{ fontSize: "13px", color: "#6B7280" }}>Thanh toán bằng tiền mặt khi nhận hàng</div>
              </div>
            </div>
            <div 
              className={`payment-option ${formData.paymentMethod === "bank" ? "selected" : ""}`}
              onClick={() => setFormData(prev => ({ ...prev, paymentMethod: "bank" }))}
              style={{
                padding: "15px",
                border: `2px solid ${formData.paymentMethod === "bank" ? "#C94D3F" : "#E5E7EB"}`,
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s",
                backgroundColor: formData.paymentMethod === "bank" ? "#FFF6F5" : "#FFF",
                display: "flex",
                alignItems: "center",
              }}
            >
              <div style={{ 
                width: "20px", 
                height: "20px", 
                borderRadius: "50%", 
                border: `2px solid ${formData.paymentMethod === "bank" ? "#C94D3F" : "#E5E7EB"}`,
                marginRight: "15px",
                position: "relative"
              }}>
                {formData.paymentMethod === "bank" && (
                  <div style={{ 
                    position: "absolute",
                    top: "3px",
                    left: "3px",
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#C94D3F"
                  }}></div>
                )}
              </div>
              <div>
                <div style={{ fontWeight: "600" }}>Thanh toán qua ngân hàng</div>
                <div style={{ fontSize: "13px", color: "#6B7280" }}>Chuyển khoản qua ví MoMo, QR code</div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="customerNote" style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontWeight: "500", 
            fontSize: "14px",
            color: "#4B5563" 
          }}>
            Ghi chú đơn hàng
          </label>
          <textarea
            id="customerNote"
            className="form-control"
            value={formData.customerNote}
            onChange={handleInputChange}
            placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay địa điểm giao hàng chi tiết hơn..."
            style={{
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              backgroundColor: "#FFF",
              width: "100%",
              minHeight: "100px",
              padding: "15px",
              fontSize: "14px",
              resize: "vertical",
              fontFamily: "inherit",
              outline: "none",
            }}
          ></textarea>
        </div>

        {/* Order summary */}
        <div className="order-summary" style={{
          marginTop: "10px",
          padding: "20px",
          backgroundColor: "#F9FAFB",
          borderRadius: "8px",
        }}>
          <h3 style={{ 
            fontSize: "16px", 
            marginBottom: "15px", 
            fontWeight: "600",
            color: "#0F172A"
          }}>Tóm tắt đơn hàng</h3>
          
          <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#4B5563" }}>Tạm tính:</span>
            <span style={{ fontWeight: "500" }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}</span>
          </div>
          
          <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#4B5563" }}>Phí vận chuyển:</span>
            <span style={{ fontWeight: "500" }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingMethod === "standard" ? 30000 : 50000)}</span>
          </div>
          
          <div style={{ 
            marginTop: "15px", 
            paddingTop: "15px", 
            borderTop: "1px solid #E5E7EB",
            display: "flex", 
            justifyContent: "space-between",
            fontSize: "16px",
            fontWeight: "600"
          }}>
            <span>Tổng cộng:</span>
            <span style={{ color: "#C94D3F" }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalTotal)}</span>
          </div>
        </div>

        {/* Service status warning if services are down */}
        {(!serviceStatus.apiGateway && !serviceStatus.orderService) && (
          <div style={{ 
            backgroundColor: "#FEF3C7", 
            padding: "15px", 
            borderRadius: "8px", 
            color: "#92400E", 
            fontSize: "14px",
            marginTop: "15px"
          }}>
            <p style={{ margin: 0, fontWeight: "500" }}>
              <span style={{ marginRight: "8px" }}>⚠️</span>
              Dịch vụ đặt hàng có thể không truy cập được. Vẫn có thể tiếp tục, nhưng có thể xảy ra lỗi.
            </p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="button"
          onClick={handleOrderSubmit}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#E5856F" : "#C94D3F",
            color: "#FFF",
            borderRadius: "8px",
            border: "none",
            height: "50px",
            marginTop: "15px",
            fontWeight: "600",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            position: "relative",
            transition: "background-color 0.2s",
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
          ) : "Xác nhận đặt hàng"}
        </button>

        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            
            input:focus, textarea:focus {
              border-color: #C94D3F;
              box-shadow: 0 0 0 3px rgba(201, 77, 63, 0.1);
            }
            
            .shipping-option:hover, .payment-option:hover {
              border-color: #E5856F;
            }
          `}
        </style>
      </form>
    </div>
  );
};

export default CheckoutForm;
