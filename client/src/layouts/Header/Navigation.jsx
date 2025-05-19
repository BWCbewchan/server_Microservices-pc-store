import "bootstrap/dist/css/bootstrap.min.css";
import { useContext, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { CiSearch } from "react-icons/ci";
import { FiShoppingCart } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
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
        logout();
        navigate("/login");
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
                        <div className="dropdown">
                            <button
                                className="btn btn-outline-primary dropdown-toggle"
                                type="button"
                                id="userDropdown"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                style={{ fontSize: "14px", borderRadius: "20px" }}
                            >
                                <span className="me-2">{currentUser.name}</span>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                <li><Link className="dropdown-item" to="/userAccount">Tài khoản của tôi</Link></li>
                                <li><Link className="dropdown-item" to="/userAccount/orders">Đơn hàng của tôi</Link></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><button className="dropdown-item" onClick={handleLogout}>Đăng xuất</button></li>
                            </ul>
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
