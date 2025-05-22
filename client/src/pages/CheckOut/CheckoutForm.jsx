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
const PAYMENT_API_URL = `${API_GATEWAY_URL}/api/payment`;
const DIRECT_PAYMENT_API_URL = "http://localhost:4545"; // Direct connection to payment service

// MoMo payment gateway URL
const MOMO_TEST_GATEWAY = "https://test-payment.momo.vn/v2/gateway/pay";

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
  
  // Add new state for payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderReference, setOrderReference] = useState(null);
  
  // Add new state for MoMo registration QR modal
  const [showMomoQRModal, setShowMomoQRModal] = useState(false);

  // Add new state for payment processing
  const [momoPaymentUrl, setMomoPaymentUrl] = useState("");

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

  // Function to create MoMo payment request (integrate new payment logic)
  const createMomoPaymentRequest = async (orderId) => {
    try {
      // Prepare parameters for MoMo payment
      const paymentParams = {
        amount: finalTotal,
        orderInfo: `Thanh toán đơn hàng PC Store #${orderId}`,
        orderId: orderId,
        requestId: `REQ_${Date.now()}`, // Generate unique request ID
        extraData: orderId // Store orderId in extraData for callback
      };
      
      console.log("Requesting MoMo payment URL with params:", paymentParams);
      
      // Try multiple ways to get payment URL
      let paymentUrl = null;
      let paymentResponse = null;
      
      // Method 1: Try through API Gateway
      try {
        const gatewayResponse = await axios.get(`${PAYMENT_API_URL}/payment`, { 
          params: paymentParams,
          timeout: 5000 
        });
        
        if (gatewayResponse.data && gatewayResponse.data.payUrl) {
          paymentUrl = gatewayResponse.data.payUrl;
          paymentResponse = gatewayResponse.data;
          console.log("MoMo payment URL obtained through API Gateway");
        }
      } catch (payErr) {
        console.warn("Failed to get payment URL through API Gateway:", payErr.message);
      }
      
      // Method 2: Try direct connection if gateway failed
      if (!paymentUrl) {
        try {
          const directResponse = await axios.get(`${DIRECT_PAYMENT_API_URL}/payment`, { 
            params: paymentParams,
            timeout: 5000 
          });
          
          if (directResponse.data && directResponse.data.payUrl) {
            paymentUrl = directResponse.data.payUrl;
            paymentResponse = directResponse.data;
            console.log("MoMo payment URL obtained through direct connection");
          }
        } catch (directErr) {
          console.warn("Failed to get payment URL through direct connection:", directErr.message);
        }
      }
      
      // Method 3: Generate fallback URL if all else fails
      if (!paymentUrl) {
        console.warn("Could not get MoMo payment URL from service, using fallback URL");
        
        // Create a simple fallback URL for testing
        const fallbackUrl = `https://test-payment.momo.vn/v2/gateway/pay?partnerCode=MOMO&orderId=${orderId}&amount=${finalTotal}&orderInfo=${encodeURIComponent(paymentParams.orderInfo)}&requestId=${paymentParams.requestId}`;
        
        paymentUrl = fallbackUrl;
      }
      
      // Log the payment URL and response
      console.log("MoMo Payment URL:", paymentUrl);
      console.log("Payment response:", paymentResponse);
      
      return paymentUrl;
    } catch (error) {
      console.error("Failed to create MoMo payment request:", error);
      throw error;
    }
  };

  // Function to check MoMo payment status
  const checkMomoPaymentStatus = async (orderId) => {
    try {
      // Try to check payment status via API Gateway
      const statusResponse = await axios.post(`${PAYMENT_API_URL}/transaction-status`, {
        orderId: orderId
      }, { timeout: 5000 });
      
      if (statusResponse.data && statusResponse.data.resultCode === 0) {
        // Payment successful, update order status
        await updateOrderPaymentStatus(orderId, 'paid');
        return { success: true, message: "Thanh toán thành công!" };
      } else {
        // Payment failed or pending
        return { 
          success: false, 
          message: statusResponse.data?.message || "Thanh toán chưa hoàn tất hoặc bị từ chối."
        };
      }
    } catch (error) {
      console.error("Failed to check MoMo payment status:", error);
      
      // Try direct connection to payment service
      try {
        const directStatusResponse = await axios.post(`${DIRECT_PAYMENT_API_URL}/transaction-status`, {
          orderId: orderId
        }, { timeout: 5000 });
        
        if (directStatusResponse.data && directStatusResponse.data.resultCode === 0) {
          // Payment successful, update order status
          await updateOrderPaymentStatus(orderId, 'paid');
          return { success: true, message: "Thanh toán thành công!" };
        } else {
          return { 
            success: false, 
            message: directStatusResponse.data?.message || "Thanh toán chưa hoàn tất hoặc bị từ chối."
          };
        }
      } catch (directError) {
        console.error("Failed to check MoMo payment status via direct connection:", directError);
        return { success: false, message: "Không thể kiểm tra trạng thái thanh toán." };
      }
    }
  };
  
  // Add this function to handle checking payment status (it's referenced but missing implementation)
  const handleCheckPaymentStatus = async () => {
    if (!orderReference) return;
    
    const orderId = orderReference.id || orderReference._id;
    setLoading(true);
    
    const statusResult = await checkMomoPaymentStatus(orderId);
    setLoading(false);
    
    if (statusResult.success) {
      toast.success(statusResult.message);
      // Update UI to reflect paid status
      setOrderReference(prev => ({
        ...prev,
        payment: { ...prev.payment, status: 'paid' },
        status: 'confirmed'
      }));
      handlePaymentComplete();
    } else {
      toast.warning(statusResult.message);
    }
  };

  // Enhance the updateOrderPaymentStatus function to be more robust
  const updateOrderPaymentStatus = async (orderId, status) => {
    try {
      console.log(`Attempting to update order ${orderId} payment status to ${status}`);
      
      const updateData = JSON.stringify({
        'payment.status': status,
        'status': status === 'paid' ? 'confirmed' : 'pending'
      });
      
      // Try API Gateway first
      try {
        const response = await axios.put(`${ORDER_API_URL}/update/${orderId}/${encodeURIComponent(updateData)}`, null, {
          timeout: 5000
        });
        console.log(`Order ${orderId} payment status updated to ${status} via API Gateway:`, response.data);
        return true;
      } catch (apiError) {
        console.warn(`Failed to update order status via API Gateway: ${apiError.message}`);
        
        // Try direct connection
        try {
          const directResponse = await axios.put(`${DIRECT_ORDER_API_URL}/update/${orderId}/${encodeURIComponent(updateData)}`, null, {
            timeout: 5000
          });
          console.log(`Order ${orderId} payment status updated to ${status} via direct connection:`, directResponse.data);
          return true;
        } catch (directError) {
          console.error(`All attempts to update order status failed: ${directError.message}`);
          
          // Try one more fallback method - direct PUT with JSON body
          try {
            const fallbackResponse = await axios.put(`${DIRECT_ORDER_API_URL}/orders/${orderId}`, {
              'payment.status': status,
              'status': status === 'paid' ? 'confirmed' : 'pending'
            }, {
              headers: {'Content-Type': 'application/json'},
              timeout: 5000
            });
            console.log(`Order ${orderId} payment status updated via fallback method:`, fallbackResponse.data);
            return true;
          } catch (fallbackError) {
            console.error(`All update attempts failed: ${fallbackError.message}`);
            return false;
          }
        }
      }
    } catch (error) {
      console.error(`Error updating order payment status: ${error.message}`);
      return false;
    }
  };

  // Check if user is returning from MoMo payment
  useEffect(() => {
    const checkReturnFromPayment = async () => {
      // Check URL parameters for MoMo payment response
      const urlParams = new URLSearchParams(window.location.search);
      const resultCode = urlParams.get('resultCode');
      const orderId = urlParams.get('orderId') || localStorage.getItem('pendingOrderId');
      
      if (resultCode && orderId) {
        // Clear the URL parameters to prevent duplicate processing
        window.history.replaceState({}, document.title, window.location.pathname);
        
        if (resultCode === '0') {
          // Payment successful
          const updated = await updateOrderPaymentStatus(orderId, 'paid');
          if (updated) {
            toast.success("Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.");
          } else {
            toast.warning("Thanh toán thành công, nhưng không thể cập nhật trạng thái đơn hàng. Vui lòng liên hệ với bộ phận hỗ trợ.");
          }
          
          // Navigate to order confirmation
          navigate("/order-confirmation", { 
            state: { 
              order: JSON.parse(localStorage.getItem('pendingOrder') || '{}'),
              cartCleared: true,
              paymentSuccess: true
            },
            replace: true
          });
        } else {
          // Payment failed
          toast.error("Thanh toán không thành công. Vui lòng thử lại sau.");
          
          // Check detailed status
          const statusResult = await checkMomoPaymentStatus(orderId);
          if (statusResult.success) {
            toast.success(statusResult.message);
          } else {
            toast.error(statusResult.message);
          }
        }
        
        // Clean up localStorage
        localStorage.removeItem('pendingOrderId');
        localStorage.removeItem('pendingOrder');
      }
    };
    
    checkReturnFromPayment();
  }, [navigate]);

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

      // Set payment status as "paid" if payment method is bank/MoMo
      const payment = { 
        method: formData.paymentMethod, 
        status: formData.paymentMethod === "bank" ? "paid" : "pending" 
      };
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
        // Always set status to "confirmed" when payment method is bank/MoMo
        status: formData.paymentMethod === "bank" ? "confirmed" : "pending"
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
        // Save order reference 
        setOrderReference(orderResp.data.order);
        toast.success("Đặt hàng thành công! Đang chuyển hướng đến trang thanh toán...");
        
        // Store the new order in localStorage before clearing cart
        localStorage.setItem('lastOrder', JSON.stringify(orderResp.data.order));
        localStorage.setItem('pendingOrderId', orderResp.data.order.id || orderResp.data.order._id);
        
        // Also store the complete order data with confirmed status
        localStorage.setItem('pendingOrder', JSON.stringify({
          ...orderResp.data.order,
          payment: { ...orderResp.data.order.payment, status: 'paid' },
          status: 'confirmed'
        }));

        // Clear cart - Enhanced cart clearing mechanism with multiple fallbacks
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
        
        try {
          const orderId = orderResp.data.order.id || orderResp.data.order._id;
          
          // Get MoMo payment URL
          const momoPaymentUrl = await createMomoPaymentRequest(orderId);
          
          // Redirect to MoMo payment page
          if (momoPaymentUrl) {
            console.log("Redirecting to MoMo payment:", momoPaymentUrl);
            window.location.href = momoPaymentUrl;
            return; // Exit early as we're redirecting
          } else {
            // Fallback to our custom payment modal if URL generation fails
            toast.warning("Không thể kết nối đến cổng thanh toán MoMo. Sử dụng phương thức thay thế.");
            setOrderReference(orderResp.data.order);
            setShowPaymentModal(true);
            setLoading(false);
            return;
          }
        } catch (paymentError) {
          console.error("Failed to connect to MoMo payment gateway:", paymentError);
          
          // Fallback to our custom payment modal
          toast.warning("Không thể kết nối đến cổng thanh toán MoMo. Sử dụng phương thức thay thế.");
          setOrderReference(orderResp.data.order);
          setShowPaymentModal(true);
          setLoading(false);
          return;
        }
      }

      // If not bank payment, continue with normal flow
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
      if (!showPaymentModal) {
        setLoading(false); // Only set loading to false if we're not showing payment modal
      }
    }
  };

  // Enhance the handlePaymentComplete function to actually update payment status
  const handlePaymentComplete = async () => {
    setLoading(true);
    
    try {
      if (!orderReference) {
        toast.error("Không tìm thấy thông tin đơn hàng!");
        setLoading(false);
        return;
      }
      
      const orderId = orderReference.id || orderReference._id;
      
      // Actually update the payment status in the database
      const updated = await updateOrderPaymentStatus(orderId, 'paid');
      
      if (updated) {
        toast.success("Cảm ơn bạn đã thanh toán! Đơn hàng của bạn đã được xác nhận.");
      } else {
        // Even if update fails, we'll continue but show a warning
        toast.warning("Không thể cập nhật trạng thái thanh toán. Hệ thống sẽ tự động cập nhật sau.");
      }
      
      // Update order reference locally to reflect paid status
      setOrderReference(prev => ({
        ...prev,
        payment: { ...prev.payment, status: 'paid' },
        status: 'confirmed'
      }));
      
      setShowPaymentModal(false);
      
      // Navigate to order confirmation with updated order data
      navigate("/order-confirmation", { 
        state: { 
          order: {
            ...orderReference,
            payment: { ...orderReference.payment, status: 'paid' },
            status: 'confirmed'
          },
          cartCleared: true,
          paymentMethod: "bank",
          paymentSuccess: true
        },
        replace: true
      });
    } catch (error) {
      console.error("Error during payment completion:", error);
      toast.error("Đã xảy ra lỗi khi xác nhận thanh toán. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Add a function to handle MoMo registration link click
  const handleMomoRegistration = (e) => {
    e.preventDefault();
    setShowMomoQRModal(true);
  };

  return (
    <div className="checkout-form-container">
      {/* MoMo Registration QR Modal */}
      {showMomoQRModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1001 // Higher than payment modal
        }}>
          <div style={{
            backgroundColor: "#FFF",
            borderRadius: "12px",
            padding: "25px",
            maxWidth: "400px",
            width: "90%",
            position: "relative",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}>
            <button 
              onClick={() => setShowMomoQRModal(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                border: "none",
                background: "none",
                fontSize: "22px",
                cursor: "pointer",
                color: "#6B7280"
              }}
            >
              ✕
            </button>
            
            <h3 style={{ textAlign: "center", marginBottom: "15px", color: "#D82D8B", fontSize: "18px" }}>
              Đăng ký MoMo qua mã QR
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ 
                backgroundColor: "#FFF0F7", 
                padding: "15px", 
                borderRadius: "8px",
                border: "1px solid #FCE7F3",
                marginBottom: "15px"
              }}>
                <img 
                  src="https://chart.googleapis.com/chart?cht=qr&chl=https://momo.vn/register&chs=200x200&choe=UTF-8&chld=L|2" 
                  alt="Mã QR đăng ký MoMo" 
                  style={{ width: "200px", height: "200px" }}
                />
              </div>
              
              <div style={{ fontSize: "14px", color: "#6B7280", textAlign: "center", marginBottom: "15px" }}>
                Quét mã QR bằng ứng dụng camera của điện thoại để tải và đăng ký MoMo
              </div>
              
              <div style={{ 
                backgroundColor: "#FFF0F7", 
                padding: "12px 15px", 
                borderRadius: "6px",
                fontSize: "13px",
                color: "#BE185D",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%"
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>Bạn cần đăng ký tài khoản MoMo để thực hiện thanh toán qua ví điện tử.</span>
              </div>
            </div>
            
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
              <a 
                href="https://momo.vn/register" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#D82D8B",
                  color: "#FFFFFF",
                  borderRadius: "6px",
                  border: "none",
                  padding: "10px 15px",
                  fontWeight: "500",
                  fontSize: "14px",
                  textDecoration: "none",
                  width: "100%"
                }}
              >
                Mở website MoMo
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "#FFF",
            borderRadius: "12px",
            padding: "30px",
            maxWidth: "450px",
            width: "90%",
            maxHeight: "90vh",
            overflowY: "auto",
            position: "relative",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}>
            <button 
              onClick={() => handlePaymentComplete()}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                border: "none",
                background: "none",
                fontSize: "22px",
                cursor: "pointer",
                color: "#6B7280"
              }}
            >
              ✕
            </button>
            
            <h3 style={{ textAlign: "center", marginBottom: "20px", color: "#111827", fontSize: "20px" }}>
              Thanh toán đơn hàng của bạn
            </h3>
            
            {/* QR Code Payment Section */}
            <div style={{ 
              backgroundColor: "#F9FAFB", 
              padding: "20px", 
              borderRadius: "8px",
              border: "1px dashed #E5E7EB"
            }}>
              <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "15px", color: "#374151", textAlign: "center" }}>
                Quét mã QR để thanh toán
              </h4>
              
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {/* Sample QR code - create a dynamic one with order details if possible */}
                <div style={{ 
                  backgroundColor: "white", 
                  padding: "10px", 
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  marginBottom: "12px"
                }}>
                  <img 
                    src={momoPaymentUrl || `https://chart.googleapis.com/chart?cht=qr&chl=PCStore:Payment:${orderReference?.id || 'order'}-${finalTotal}&chs=300x300&choe=UTF-8&chld=L|1`}
                    alt="Mã QR thanh toán" 
                    style={{ width: "250px", height: "250px" }}
                    onError={(e) => {
                      e.target.src = "https://chart.googleapis.com/chart?cht=qr&chl=PCStore:Payment:Fallback&chs=200x200&choe=UTF-8&chld=L|2";
                    }}
                  />
                </div>
                
                <div style={{ fontSize: "14px", color: "#4B5563", marginBottom: "10px", textAlign: "center" }}>
                  Số tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalTotal)}
                </div>
                
                <div style={{ fontSize: "13px", color: "#6B7280", textAlign: "center" }}>
                  Quét mã QR bằng ứng dụng MoMo hoặc ứng dụng ngân hàng để thanh toán
                </div>
              </div>
              
              <div style={{ marginTop: "20px" }}>
                <h5 style={{ fontSize: "13px", fontWeight: "600", marginBottom: "10px", color: "#374151" }}>
                  Hoặc chuyển khoản theo thông tin:
                </h5>
                <ul style={{ fontSize: "13px", color: "#4B5563", paddingLeft: "20px", margin: "0" }}>
                  <li style={{ marginBottom: "5px" }}>Ngân hàng: <span style={{ fontWeight: "500" }}>Techcombank</span></li>
                  <li style={{ marginBottom: "5px" }}>Số tài khoản: <span style={{ fontWeight: "500" }}>19037121345678</span></li>
                  <li style={{ marginBottom: "5px" }}>Chủ tài khoản: <span style={{ fontWeight: "500" }}>CÔNG TY TNHH PC STORE</span></li>
                  <li style={{ marginBottom: "5px" }}>Nội dung: <span style={{ fontWeight: "500" }}>
                    {orderReference ? `Thanh toan DH${orderReference.id || orderReference._id}` : 'Thanh toan don hang'}
                  </span></li>
                </ul>
              </div>
              
              <div style={{ 
                marginTop: "15px", 
                backgroundColor: "#FEF2F2", 
                padding: "10px 15px", 
                borderRadius: "6px",
                fontSize: "12px",
                color: "#991B1B" 
              }}>
                <p style={{ margin: "0" }}>
                  <strong>Lưu ý:</strong> Đơn hàng sẽ được xử lý sau khi chúng tôi xác nhận đã nhận được thanh toán của bạn.
                </p>
              </div>
            </div>
            
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
              <a 
                href="https://momo.vn/register" 
                onClick={handleMomoRegistration}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  color: "#D82D8B", // MoMo pink color
                  fontSize: "13px",
                  textDecoration: "none",
                  fontWeight: "500",
                  padding: "7px 12px",
                  backgroundColor: "#FFF0F7",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                Đăng ký MoMo
              </a>
              
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleCheckPaymentStatus}
                  style={{
                    backgroundColor: "#4F46E5",
                    color: "#FFF",
                    borderRadius: "6px",
                    border: "none",
                    padding: "10px 15px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  disabled={loading}
                >
                  {loading ? "Đang kiểm tra..." : "Kiểm tra thanh toán"}
                </button>
                
                <button
                  onClick={handlePaymentComplete}
                  style={{
                    backgroundColor: "#C94D3F",
                    color: "#FFF",
                    borderRadius: "6px",
                    border: "none",
                    padding: "10px 20px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                >
                  Đã thanh toán xong
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
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
            {/* COD option - unchanged */}
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
            
            {/* Bank transfer option - simplified, QR moved to modal */}
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
                <div style={{ fontSize: "12px", color: "#C94D3F", marginTop: "6px" }}>
                  Bạn sẽ được chuyển hướng đến trang thanh toán MoMo
                </div>
                
                {/* Add MoMo registration link directly in the payment option */}
                {formData.paymentMethod === "bank" && (
                  <div style={{ marginTop: "10px" }}>
                    <a
                      href="https://momo.vn/register"
                      onClick={handleMomoRegistration}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        color: "#D82D8B",
                        fontSize: "13px",
                        textDecoration: "none",
                        fontWeight: "500",
                        padding: "5px 10px",
                        backgroundColor: "#FFF0F7",
                        borderRadius: "4px",
                        transition: "all 0.2s"
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}>
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                      Đăng ký MoMo ngay
                    </a>
                  </div>
                )}
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
          ) : formData.paymentMethod === "bank" ? "Xác nhận đặt hàng & Thanh toán" : "Xác nhận đặt hàng"}
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
