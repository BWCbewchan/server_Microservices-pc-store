import "bootstrap/dist/css/bootstrap.min.css";
import { useContext, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { CiSearch } from "react-icons/ci";
import { FiShoppingCart } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Logo from "../../assets/images/logo.png";
import { AuthContext } from "../../context/AuthContext";

const Navigation = () => {
    const [showSearch, setShowSearch] = useState(false);
    const navigate = useNavigate();
    const { currentUser, logout } = useContext(AuthContext);

    const categories = [
        "Laptops",
        "Desktop PCs",
        "Networking Devices",
        "Printers & Scanners",
        "PC Parts",
        "All Other Products",
        "Repairs",
    ];

    const handleLogout = () => {
        if (window.confirm('Bạn có chắc muốn đăng xuất không?')) {
            const success = logout();
            if (success) {
                toast.info('Đăng xuất thành công');
                navigate('/login');
            } else {
                toast.error('Có lỗi khi đăng xuất');
            }
        }
    };

    return (
        <div
            className="container-fluid"
            style={{
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                backgroundColor: '#fff',
            }}>
            <div
                className="container"
                style={{
                    width: "100%",
                    padding: "10px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}>
                {/* Logo */}
                <Link to="/">
                    <img
                        src={Logo}
                        alt="Logo"
                        style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "contain",
                            backgroundColor: "#fff",
                            cursor: "pointer"
                        }}
                    />
                </Link>

                {/* Conditional Rendering */}
                {!showSearch ? (
                    // Categories Section
                    <div
                        style={{
                            display: "flex",
                            gap: "20px",
                            flexGrow: 1,
                            justifyContent: "center",
                        }}
                    >
                        {categories.map((category, index) => (
                            <Link to="/catalog"
                                key={index}
                                style={{
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    color: "#000",
                                }}
                                onMouseOver={(e) => (e.target.style.color = "#007bff")}
                                onMouseOut={(e) => (e.target.style.color = "#000")}
                            >
                                {category}
                            </Link>
                        ))}
                    </div>
                ) : (
                    // Search Input Section
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: "#fff",
                            borderRadius: "25px",
                            padding: "10px 20px",
                            flexGrow: 1,
                            marginLeft: "20px",
                            transition: "all 0.3s ease-in-out",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <CiSearch size={20} color="#007bff" style={{ marginRight: "10px" }} />
                        <input
                            type="text"
                            placeholder="Search entire store here..."
                            style={{
                                border: "none",
                                outline: "none",
                                width: "100%",
                                fontSize: "14px",
                                backgroundColor: "transparent",
                            }}
                            autoFocus
                        />
                    </div>
                )}

                {/* Icons */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                        marginLeft: "20px",
                    }}
                >
                    {showSearch ? (
                        <AiOutlineClose
                            size={24}
                            color="#007bff"
                            style={{ cursor: "pointer" }}
                            onClick={() => setShowSearch(false)}
                        />
                    ) : (
                        <CiSearch
                            size={24}
                            style={{ cursor: "pointer" }}
                            onClick={() => setShowSearch(true)}
                        />
                    )}
                    <FiShoppingCart size={24} style={{ cursor: "pointer" }}
                        onClick={() => navigate('/cart')}
                    />

                    {/* Hiển thị menu User nếu đã đăng nhập, ngược lại hiển thị nút Đăng nhập/Đăng ký */}
                    {currentUser ? (
                        <div className="d-flex align-items-center">
                            {/* User name - directly clickable to profile */}
                            <button
                                className="btn btn-outline-primary me-2"
                                onClick={() => navigate('/userAccount')}
                                style={{ 
                                    fontSize: "14px", 
                                    borderRadius: "20px",
                                    display: "flex",
                                    alignItems: "center"
                                }}
                                title="Xem thông tin cá nhân"
                            >
                                {/* User avatar or icon */}
                                <i className="fas fa-user-circle me-2"></i>
                                <span>{currentUser.name || 'Người dùng'}</span>
                            </button>
                            
                            {/* Options dropdown */}
                            <div className="dropdown me-2">
                                <button
                                    className="btn btn-outline-secondary dropdown-toggle"
                                    type="button"
                                    id="userOptions"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                    style={{ 
                                        fontSize: "14px", 
                                        borderRadius: "20px",
                                        padding: "0.375rem 0.75rem"
                                    }}
                                >
                                    <i className="fas fa-cog"></i>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userOptions">
                                    <li><Link className="dropdown-item" to="/userAccount/orders">Đơn hàng của tôi</Link></li>
                                    <li><Link className="dropdown-item" to="/userAccount/wishlist">Sản phẩm yêu thích</Link></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><button className="dropdown-item text-danger" onClick={handleLogout}>Đăng xuất</button></li>
                                </ul>
                            </div>
                            
                            {/* Direct logout button */}
                            <button
                                className="btn btn-danger"
                                style={{ fontSize: "14px", borderRadius: "20px" }}
                                onClick={handleLogout}
                                title="Đăng xuất"
                            >
                                <i className="fas fa-sign-out-alt"></i> Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <>
                            <button
                                className="btn btn-outline-primary"
                                style={{ fontSize: "14px", borderRadius: "20px" }}
                                onClick={() => navigate('/login')}
                            >
                                Đăng nhập
                            </button>
                            <button
                                className="btn btn-outline-primary"
                                style={{ fontSize: "14px", borderRadius: "20px" }}
                                onClick={() => navigate('/signup')}
                            >
                                Đăng ký
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navigation;
