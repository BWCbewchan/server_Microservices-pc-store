import axios from "axios";
import * as React from "react";
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";

// Định nghĩa các API URL (điều chỉnh theo backend của bạn)
const CART_API_URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/cart`;
const PRODUCT_API_URLGetInfo = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/product`; // Giả sử endpoint lấy thông tin sản phẩm

const Cart = () => {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [cart, setCart] = React.useState(null);
    const [products, setProducts] = React.useState({});
    const [selectedItems, setSelectedItems] = React.useState({});
    const [error, setError] = React.useState("");

    // Check if user is logged in and verified
    React.useEffect(() => {
        if (!currentUser) {
            toast.error("Vui lòng đăng nhập để xem giỏ hàng");
            navigate("/login");
            return;
        }

        if (!currentUser.isVerified) {
            toast.warning("Vui lòng xác thực tài khoản để sử dụng giỏ hàng");
            navigate("/verify", {
                state: {
                    email: currentUser.email,
                    fromCart: true
                }
            });
            return;
        }

        fetchCart();
    }, [currentUser, navigate]);

    // Load giỏ hàng khi component mount
    const fetchCart = async () => {
        try {
            setError("");
            const userId = currentUser?.id || currentUser?._id;
            if (!userId) {
                toast.error("Không xác định được thông tin người dùng");
                return;
            }

            const res = await axios.get(`${CART_API_URL}/${userId}`);
            const cartData = res.data;
            setCart(cartData);

            // Khởi tạo trạng thái selectedItems (false cho mỗi productId)
            const initialSelected = {};
            cartData.items.forEach(item => {
                initialSelected[item.productId] = false;
            });
            setSelectedItems(initialSelected);

            if (cartData.items.length > 0) {
                await fetchProductDetails(cartData.items.map(item => item.productId));
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            console.error("Lỗi khi tải giỏ hàng:", err.message);
        }
    };

    // Hàm lấy thông tin chi tiết sản phẩm theo danh sách productIds
    const fetchProductDetails = async (productIds) => {
        try {
            setError("");
            const responses = await Promise.all(
                productIds.map(id => axios.get(`${PRODUCT_API_URLGetInfo}/${id}`))
            );
            const productData = responses.reduce((acc, res) => {
                // Lấy dữ liệu sản phẩm từ trường "data" của response
                const product = res.data.data;
                acc[product._id] = product;
                return acc;
            }, {});
            setProducts(productData);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            console.error("Lỗi khi tải chi tiết sản phẩm:", err.message);
        }
    };

    // Cập nhật số lượng sản phẩm
    const handleUpdateQuantity = async (productId, newQuantity) => {
        try {
            setError("");
            const userId = currentUser?.id || currentUser?._id;
            const res = await axios.put(`${CART_API_URL}/update/${userId}/${productId}/${newQuantity}`);
            setCart(res.data.cart);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            console.error("Lỗi khi cập nhật số lượng:", err.message);
        }
    };

    // Xóa 1 sản phẩm khỏi giỏ hàng
    const handleRemoveItem = async (productId) => {
        if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?")) return;
        try {
            setError("");
            const userId = currentUser?.id || currentUser?._id;
            const res = await axios.delete(`${CART_API_URL}/remove/${userId}/${productId}`);
            setCart(res.data.cart);
            setSelectedItems(prev => {
                const newSelected = { ...prev };
                delete newSelected[productId];
                return newSelected;
            });
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            console.error("Lỗi khi xóa sản phẩm:", err.message);
        }
    };

    // Xóa toàn bộ giỏ hàng
    const handleClearCart = async () => {
        if (!window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) return;
        try {
            setError("");
            const userId = currentUser?.id || currentUser?._id;
            const res = await axios.delete(`${CART_API_URL}/clear/${userId}`);
            setCart(res.data.cart);
            setSelectedItems({});
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            console.error("Lỗi khi xóa toàn bộ giỏ hàng:", err.message);
        }
    };

    // Hàm toggle chọn sản phẩm
    const handleToggleSelection = (productId) => {
        setSelectedItems(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }));
    };

    // Format price with Vietnamese currency
    const formatPrice = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    if (error) {
        return <div className="container mx-auto p-4">Lỗi: {error}</div>;
    }

    if (!cart) {
        return (
            <div className="container mx-auto p-4">
                <p>Đang tải giỏ hàng...</p>
            </div>
        );
    }

    // Chuyển đổi data từ API thành dạng dùng cho giao diện (cartItems)
    const cartItems = cart.items.map(item => {
        const product = products[item.productId];
        return {
            name: product?.name || "",
            image: product?.image || "",
            description: product?.name || "Sản phẩm chưa cập nhật",
            price: product?.price ? product.price.toString() : "0.00",
            quantity: item.quantity,
            productId: item.productId
        };
    });

    // Lấy danh sách sản phẩm được chọn
    const selectedCartItems = cartItems.filter(item => selectedItems[item.productId]);

    // Tính toán tổng tiền chỉ tính cho sản phẩm được chọn
    const subtotal = selectedCartItems.reduce((acc, item) => {
        return acc + item.quantity * parseFloat(item.price.toString().replace(/[^\d]/g, ""));
    }, 0);
    const total = subtotal;

    return (
        <div className="bg-white d-flex flex-column overflow-hidden">
            <div className="container mt-4">
                <h1 className="fw-bold">Shopping Cart</h1>
                <div className="row mt-4">
                    <div className="col-lg-8">
                        <div className="d-flex fw-bold align-items-center mt-4">
                            <div style={{ flex: 0.2 }}></div>
                            <div style={{ flex: 2, textAlign: "left" }}>Item</div>
                            <div style={{ flex: 1, paddingLeft: "48px" }}>Price</div>
                            <div style={{ flex: 1 }}>Qty</div>
                            <div style={{ flex: 1 }}>Subtotal</div>
                        </div>

                        {cart.items.length === 0 ? (
                            <div className="m-5 text-center">
                                <p>
                                    Giỏ hàng của bạn đang trống <Link to="/home">Tiếp tục mua sắm</Link>
                                </p>
                            </div>
                        ) : (
                            cartItems.map((item, index) => (
                                <CartItem
                                    key={index}
                                    {...item}
                                    isChecked={selectedItems[item.productId] || false}
                                    onToggle={() => handleToggleSelection(item.productId)}
                                    onQuantityChange={(desc, newQuantity) => handleUpdateQuantity(item.productId, newQuantity)}
                                    onRemove={() => handleRemoveItem(item.productId)}
                                />
                            ))
                        )}

                        <div className="d-flex justify-content-between mt-5 mb-5">
                            <button className="btn btn-outline-secondary">Continue Shopping</button>
                            <button className="btn btn-dark" onClick={handleClearCart}>Clear Shopping Cart</button>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <CartSummary subtotal={subtotal} total={total} selectedCartItems={selectedCartItems} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
