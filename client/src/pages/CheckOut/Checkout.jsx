import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import CheckoutForm from "./CheckoutForm";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useContext(AuthContext);
  const [selectedItems, setSelectedItems] = useState([]);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [loading, setLoading] = useState(true);
  const [storedUser, setStoredUser] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);

        let userId = null;
        let user = null;

        if (currentUser) {
          userId = currentUser.id || currentUser._id;
          user = currentUser;
        } else {
          const storedUserData = localStorage.getItem('user') || sessionStorage.getItem('user');
          if (storedUserData) {
            try {
              const userData = JSON.parse(storedUserData);
              userId = userData.id || userData._id;
              user = userData;
              setStoredUser(userData);
              console.log("Using user data from localStorage:", userData);
            } catch (parseErr) {
              console.error("Failed to parse stored user data:", parseErr);
            }
          }
        }

        if (!userId) {
          toast.warning("Vui lòng đăng nhập để tiếp tục thanh toán");
          navigate("/login");
          return;
        }

        // Fetch cart items logic here
        // Example: setSelectedItems(response.data.items);
        // Example: setSubtotal(response.data.subtotal);
        // Example: setFinalTotal(response.data.finalTotal);
      } catch (error) {
        console.error("Error loading checkout data:", error);
        toast.error("Không thể tải dữ liệu thanh toán");
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [currentUser, location.state, navigate]);

  // Format price with Vietnamese currency
  const formatPrice = (value) => {
    if (!value && value !== 0) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="container my-5">
      <h1 className="mb-4" style={{
        color: "#0F172A",
        fontSize: "28px",
        fontWeight: "700",
        textAlign: "center"
      }}>Thanh toán đơn hàng</h1>

      <div className="row">
        {/* Cart Items */}
        <div className="col-lg-5 mb-4">
          <div className="card" style={{
            borderRadius: "12px",
            overflow: "hidden",
            border: "none",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)"
          }}>
            <div className="card-header" style={{
              backgroundColor: "#F8FAFC",
              borderBottom: "1px solid #E2E8F0",
              padding: "15px 20px"
            }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
                Sản phẩm trong giỏ hàng ({selectedItems.length})
              </h3>
            </div>
            <div className="card-body p-0">
              {selectedItems.length === 0 ? (
                <div className="text-center p-4">
                  <p className="mb-0">Giỏ hàng của bạn trống</p>
                </div>
              ) : (
                <div>
                  {selectedItems.map((item) => (
                    <div
                      key={item.productId}
                      className="d-flex align-items-center p-3 border-bottom"
                      style={{ padding: "15px 20px" }}
                    >
                      <div className="me-3" style={{ width: "70px", height: "70px" }}>
                        <img
                          src={item.image || "https://via.placeholder.com/70"}
                          alt={item.name}
                          className="img-fluid rounded"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <div className="flex-grow-1">
                        <h5 style={{ fontSize: "16px", fontWeight: "500", marginBottom: "5px" }}>{item.name}</h5>
                        <div className="d-flex justify-content-between align-items-center">
                          <div style={{ color: "#6B7280", fontSize: "14px" }}>
                            SL: {item.quantity}
                          </div>
                          <div className="fw-bold" style={{ color: "#C94D3F" }}>
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div style={{ padding: "15px 20px" }}>
                    <div className="d-flex justify-content-between mb-2">
                      <span style={{ color: "#6B7280" }}>Tạm tính:</span>
                      <span>
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span style={{ color: "#6B7280" }}>Phí vận chuyển:</span>
                      <span>
                        {formatPrice(shippingMethod === "standard" ? 30000 : 50000)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between fw-bold mt-3 pt-3 border-top">
                      <span>Tổng cộng:</span>
                      <span style={{ color: "#C94D3F", fontSize: "18px" }}>
                        {formatPrice(finalTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="col-lg-7">
          <CheckoutForm
            selectedItems={selectedItems}
            shippingMethod={shippingMethod}
            setShippingMethod={setShippingMethod}
            subtotal={subtotal}
            finalTotal={finalTotal}
          />
        </div>
      </div>
    </div>
  );
};

export default Checkout;