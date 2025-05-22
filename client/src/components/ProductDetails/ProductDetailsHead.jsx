import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { AuthContext } from "../../context/AuthContext";
import { checkAuthBeforeCart } from "../../utils/authChecker";

function ProductDetailsHead({ activeTab, setActiveTab, price }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const styles = {
    container: {
      fontSize: 14,
      fontFamily: "Poppins, sans-serif",
      textAlign: "center",
      margin: "8px auto",
    },
    activeTab: { color: "#000", borderBottom: "2px solid #0156FF", cursor: "pointer" },
    tab: { borderBottom: "2px solid transparent", cursor: "pointer" },
    price: { fontSize: 14, color: "#000", fontWeight: 400 },
    priceBold: { fontWeight: 600 },
    quantityInput: {
      width: 50,
      height: 30,
      textAlign: "center",
      border: "1px solid #ddd",
      borderRadius: 5,
    },
  };

  // Format price with dollar sign, commas and two decimal places
  const formatPrice = (value) => {
    if (!value) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const tabs = ["about", "details", "specs"];
  // State cho số lượng sản phẩm, mặc định là 1
  const [quantity, setQuantity] = useState(1);

  // State lưu thông tin tồn kho của sản phẩm (được lấy từ API)
  const [inventoryInfo, setInventoryInfo] = useState(null);
  // Fetch thông tin tồn kho khi component mount hoặc id thay đổi
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/inventory/${id}`);
        setInventoryInfo(data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin tồn kho", error);
      }
    };
    if (id) fetchInventory();
  }, [id]);

  // Định nghĩa API URL add to cart với URL params
  const CART_API_URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/cart/add`;

  // Xử lý thêm sản phẩm vào giỏ hàng qua API
  const handleAddToCart = async () => {
    console.log("Thêm vào giỏ hàng với ID:", id);

    // Check authentication and verification before proceeding
    if (!checkAuthBeforeCart(currentUser, navigate)) {
      return;
    }

    if (!id) {
      alert("Product ID is not defined!");
      return;
    }
    
    try {
      // Use the actual user ID instead of fake one
      const userId = currentUser.id || currentUser._id;
      const res = await axios.post(`${CART_API_URL}/${userId}/${id}/1`);
      
      toast.success("🛒Thêm vào giỏ hàng thành công");
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng", error.response?.data || error.message);
      toast.error("Không thể thêm sản phẩm vào giỏ hàng");
    }
  };

  // Tính giá sau discount
  const finalPrice = price;
  // Xác định trạng thái vô hiệu hóa nút: nếu chưa có thông tin tồn kho hoặc out of stock
  const isOutOfStock = !inventoryInfo || !inventoryInfo.inStock || inventoryInfo.stockInInventory <= 0;
  return (
    <div className="container" style={styles.container}>
      <div className="bg-white d-flex flex-column align-items-center justify-content-center p-4">
        <div className="d-flex flex-wrap justify-content-between w-100" style={{ maxWidth: "73%" }}>
          <div className="d-flex justify-content-center gap-3 text-secondary fw-semibold cursor-pointer">
            {tabs.map((tab) => (
              <div
                key={tab}
                className={
                  activeTab === tab
                    ? "text-dark d-flex flex-column justify-content-center"
                    : "d-flex flex-column justify-content-center"
                }
                style={activeTab === tab ? styles.activeTab : styles.tab}
                onClick={() => setActiveTab(tab)}
              >
                <div>{tab.charAt(0).toUpperCase() + tab.slice(1)}</div>
              </div>
            ))}
          </div>
          <div className="d-flex align-items-center gap-3 py-2">
            <span style={styles.price}>
              On Sale from <span style={styles.priceBold}>{formatPrice(finalPrice)}</span>
            </span>
            {/* THÔNG BÁO SỐ LƯỢNG THẤP */}
            {inventoryInfo?.stockInInventory > 0 && inventoryInfo.stockInInventory < 10 && (
              <div className="text-danger fw-bold small">
                ⚠️ Chỉ còn {inventoryInfo.stockInInventory} sản phẩm!
              </div>
            )}
            <button
              className="btn btn-primary rounded-pill px-4"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              style={{
                opacity: isOutOfStock ? 0.5 : 1,
                pointerEvents: isOutOfStock ? "none" : "auto",
                fontSize: 14,
                padding: "8px 0px",
                margin: "0 10px",
              }}
              title={isOutOfStock ? "Sản phẩm đã hết hàng" : ""}
            >
              Add to Cart
            </button>

            <button
              className="btn btn-warning rounded-pill d-flex align-items-center justify-content-center"
              style={{ width: 80, height: 40 }}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" width="50" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsHead;
