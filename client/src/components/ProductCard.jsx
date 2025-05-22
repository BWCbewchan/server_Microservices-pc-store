import PropTypes from "prop-types";
import { useState, useContext } from "react";
import ICONS from "../constants/icons";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import { AuthContext } from "../context/AuthContext";
import { checkAuthBeforeCart } from "../utils/authChecker";

const ProductCard = ({ _id, stock, image, rating, name, price, discount }) => {
  const [hover, setHover] = useState(false);
  const CART_API_URL = "http://localhost:3000/api/cart/add";
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  // UserId giả dùng cho demo
  const fakeUserId = "64e65e8d3d5e2b0c8a3e9f12";

  // Calculate final price
  const finalPrice = price - (price * discount) / 100;

  // Format price with dollar sign, commas and two decimal places
  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Xử lý thêm sản phẩm vào giỏ hàng
  const handleAddToCart = async (productId, e) => {
    // Prevent navigation to product details
    e.preventDefault();
    e.stopPropagation();
    
    // Check authentication and verification
    if (!checkAuthBeforeCart(currentUser, navigate)) {
      return;
    }
    
    try {
      // Use the actual user ID instead of fake one
      const userId = currentUser.id || currentUser._id;
      const res = await axios.post(`${CART_API_URL}/${userId}/${productId}/1`);
      toast.success("🛒Thêm vào giỏ hàng thành công");
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng", error.response?.data || error.message);
      toast.error("Không thể thêm sản phẩm vào giỏ hàng");
    }
  };

  return (
    <NavLink
      to={`/details/${_id}`}
      className={`card px-2 px-sm-3 px-md-4 px-lg-5 py-2 py-md-3 py-lg-3 h-100 border-0 position-relative holographic-card`}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
    >
      <div className="badge position-absolute top-0 start-0 m-1 m-sm-2">
        {stock > 0 ? (
          <span className="d-flex align-items-center gap-1 gap-sm-2 fw-medium" style={{ color: "#78A962", fontSize: "0.75rem" }}>
            <img src={ICONS.Check} alt="" className="img-fluid" style={{ maxWidth: "16px" }} />
            in Stock
          </span>
        ) : (
          <span className="d-flex align-items-center gap-1 gap-sm-2 fw-medium" style={{ color: "#C94D3F", fontSize: "0.75rem" }}>
            <img src={ICONS.CallCheck} alt="" className="img-fluid" style={{ maxWidth: "16px" }} />
            check Availability
          </span>
        )}
      </div>
      {hover && stock > 0 && (
        <button
          className="position-absolute top-0 end-0 m-1 m-sm-2 btn m-0 p-0 border-0 hover"
          onClick={(e) => handleAddToCart(_id, e)}
        >
          <img src={ICONS.Cart} alt="" className="hover cart-icon" style={{ maxWidth: "25px" }} />
        </button>
      )}
      <div className="text-center">
        <img
          src={image}
          className="img-fluid mx-auto mb-2 mt-2 mt-md-3 mt-lg-4 product-image"
          style={{
            maxWidth: "100%",
            height: "80px",
            objectFit: "contain"
          }}
        />
      </div>
      <div className="card-body d-flex flex-column p-0 p-sm-1 p-md-2">
        <div className="d-flex justify-content-between align-items-center mb-1 mb-sm-2">
          {/* Rating stars */}
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/c69911b8ada2410925a43ecf4446ac533bac25e2ad400b898670da368828a79d?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a"
            alt="Rating stars"
            className="img-fluid rating-stars"
            style={{ width: "60px", maxWidth: "100%" }}
          />
          <small className="reviews-text" style={{ color: "#A2A6B0", fontSize: "0.7rem" }}>Reviews ({rating})</small>
        </div>
        <p
          className="card-title mb-1 mb-sm-2 product-title"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxHeight: "2.8em",
            fontSize: "0.75rem",
            fontWeight: "500",
          }}
        >
          {name}
        </p>
        <div className="mt-auto price-section">
          {discount > 0 && (
            <span className="text-muted text-decoration-line-through original-price" style={{ fontSize: "0.7rem" }}>
              {formatPrice(price)}
            </span>
          )}
          <br />
          <span className="fw-bold final-price" style={{ fontSize: "0.85rem" }}>{formatPrice(finalPrice)}</span>
        </div>
      </div>

      {/* Add responsive styles for different screen sizes */}
      <style jsx="true">{`
        @media (min-width: 992px) {
          .product-image {
            height: 150px !important;
          }
          .product-title {
            font-size: 1rem !important;
          }
          .rating-stars {
            width: 90px !important;
          }
          .reviews-text {
            font-size: 0.85rem !important;
          }
          .final-price {
            font-size: 1.1rem !important;
          }
          .original-price {
            font-size: 0.9rem !important;
          }
          .cart-icon {
            max-width: 30px !important;
          }
        }
      `}</style>
    </NavLink>
  );
};

ProductCard.propTypes = {
  _id: PropTypes.string.isRequired,
  stock: PropTypes.number.isRequired,
  image: PropTypes.string.isRequired,
  rating: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  discount: PropTypes.number.isRequired,
};

export default ProductCard;
