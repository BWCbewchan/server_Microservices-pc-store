import "bootstrap/dist/css/bootstrap.min.css";
import { useContext, useState, useEffect, useRef } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { CiSearch } from "react-icons/ci";
import { FiShoppingCart } from "react-icons/fi";
import { FaUser, FaSignOutAlt, FaClipboardList, FaHeart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Logo from "../../assets/images/logo.png";
import { AuthContext } from "../../context/AuthContext";

const Navigation = () => {
    const [showSearch, setShowSearch] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
    const navigate = useNavigate();
    const { currentUser, logout } = useContext(AuthContext);
    const dropdownRef = useRef(null);
    const mobileDropdownRef = useRef(null);
    const desktopDropdownRef = useRef(null);

    // Đóng dropdown khi click bên ngoài - tách biệt xử lý cho mobile và desktop
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Xử lý dropdown cho desktop
            if (!isMobile && desktopDropdownRef.current &&
                !desktopDropdownRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }

            // Xử lý dropdown cho mobile (ngay cả khi menu đóng)
            if (isMobile && mobileDropdownRef.current &&
                !mobileDropdownRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMobile]);

    // Theo dõi kích thước màn hình
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 992;
            setIsMobile(mobile);
            if (window.innerWidth >= 992) {
                setExpanded(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    const toggleUserDropdown = () => {
        setShowUserDropdown(!showUserDropdown);
    };

    const categories = [
        "Laptops",
        "Desktop PCs",
        "Networking Devices",
        "Printers & Scanners",
        "PC Parts",
        "All Other Products",
        "Repairs",
    ];

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white py-2">
            <div className="container">
                {/* Logo */}
                <Link className="navbar-brand" to="/">
                    <img
                        src={Logo}
                        alt="Logo"
                        width="50"
                        height="50"
                        className="d-inline-block"
                    />
                </Link>

                {/* Mobile Actions: Search, Cart, User Icon */}
                <div className="d-flex align-items-center order-lg-last ms-auto me-2">
                    <div className="nav-item mx-2">
                        {showSearch ? (
                            <button
                                className="btn btn-link p-0 border-0"
                                onClick={() => setShowSearch(false)}
                                aria-label="Close search"
                            >
                                <AiOutlineClose size={22} color="#007bff" />
                            </button>
                        ) : (
                            <button
                                className="btn btn-link p-0 border-0"
                                onClick={() => setShowSearch(true)}
                                aria-label="Open search"
                            >
                                <CiSearch size={22} />
                            </button>
                        )}
                    </div>

                    <div className="nav-item mx-2">
                        <button
                            className="btn btn-link p-0 border-0 position-relative"
                            onClick={() => navigate('/cart')}
                            aria-label="Cart"
                        >
                            <FiShoppingCart size={22} />
                            {/* Optional badge for cart items */}
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                2
                                <span className="visually-hidden">items in cart</span>
                            </span>
                        </button>
                    </div>

                    {/* User icon for mobile - moved outside navbar-collapse */}
                    {currentUser && isMobile && (
                        <div className="nav-item mx-2 d-lg-none position-relative" ref={mobileDropdownRef}>
                            <button
                                className="btn btn-link p-0 border-0"
                                onClick={toggleUserDropdown}
                                aria-label="User menu"
                            >
                                <FaUser size={22} className="text-primary" />
                            </button>

                            {/* Mobile dropdown menu - OUTSIDE the collapsible area */}
                            {showUserDropdown && (
                                <div
                                    className="position-absolute end-0 mt-2 shadow dropdown-menu show"
                                    style={{ minWidth: "260px", zIndex: "1500" }}
                                >
                                    {/* User info section */}
                                    <div className="px-3 py-2 border-bottom">
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="bg-light rounded-circle p-2 me-2">
                                                <FaUser size={24} className="text-primary" />
                                            </div>
                                            <div>
                                                <h6 className="mb-0">{currentUser.name || 'Người dùng'}</h6>
                                                <small className="text-muted">{currentUser.email}</small>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu items */}
                                    <Link
                                        className="dropdown-item py-2"
                                        to="/userAccount"
                                        onClick={() => { setShowUserDropdown(false); setExpanded(false); }}
                                    >
                                        <FaUser className="me-2 text-muted" />
                                        Trang cá nhân
                                    </Link>
                                    <Link
                                        className="dropdown-item py-2"
                                        to="/userAccount/orders"
                                        onClick={() => { setShowUserDropdown(false); setExpanded(false); }}
                                    >
                                        <FaClipboardList className="me-2 text-muted" />
                                        Đơn hàng của tôi
                                    </Link>
                                    <Link
                                        className="dropdown-item py-2"
                                        to="/userAccount/wishlist"
                                        onClick={() => { setShowUserDropdown(false); setExpanded(false); }}
                                    >
                                        <FaHeart className="me-2 text-muted" />
                                        Sản phẩm yêu thích
                                    </Link>
                                    <div className="dropdown-divider"></div>
                                    <button
                                        className="dropdown-item py-2 text-danger"
                                        onClick={() => {
                                            setShowUserDropdown(false);
                                            handleLogout();
                                        }}
                                    >
                                        <FaSignOutAlt className="me-2" />
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Toggle Button */}
                <button
                    className="navbar-toggler"
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    aria-controls="navbarContent"
                    aria-expanded={expanded}
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Collapsible Content */}
                <div className={`collapse navbar-collapse ${expanded ? 'show' : ''}`} id="navbarContent">
                    {/* Search bar for mobile */}
                    {showSearch && (
                        <div className="my-3 d-block d-lg-none">
                            <div className="input-group">
                                <span className="input-group-text bg-light border-0">
                                    <CiSearch size={18} />
                                </span>
                                <input
                                    type="text"
                                    className="form-control bg-light border-0"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}

                    {/* Category Links */}
                    <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
                        {categories.map((category, index) => (
                            <li className="nav-item" key={index}>
                                <Link
                                    className="nav-link"
                                    to="/catalog"
                                    onClick={() => setExpanded(false)}
                                >
                                    {category}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* User Menu for Desktop and Mobile (trong navbar) */}
                    <div className="d-flex align-items-center">
                        {currentUser ? (
                            <div className={`${isMobile ? 'w-100 d-none' : 'position-relative'}`} ref={desktopDropdownRef}>
                                {/* Button for desktop only */}
                                {!isMobile && (
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={toggleUserDropdown}
                                        style={{
                                            fontSize: "14px",
                                            borderRadius: "20px",
                                            display: "flex",
                                            alignItems: "center"
                                        }}
                                    >
                                        <FaUser className="me-2" />
                                        <span className="d-none d-sm-inline">{currentUser.name || 'Người dùng'}</span>
                                    </button>
                                )}

                                {/* Dropdown menu for desktop only */}
                                {!isMobile && showUserDropdown && (
                                    <div
                                        className="position-absolute end-0 mt-2 shadow dropdown-menu show"
                                        style={{ minWidth: "260px", zIndex: "1000" }}
                                    >
                                        {/* User info section */}
                                        <div className="px-3 py-2 border-bottom">
                                            <div className="d-flex align-items-center mb-2">
                                                <div className="bg-light rounded-circle p-2 me-2">
                                                    <FaUser size={24} className="text-primary" />
                                                </div>
                                                <div>
                                                    <h6 className="mb-0">{currentUser.name || 'Người dùng'}</h6>
                                                    <small className="text-muted">{currentUser.email}</small>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menu items */}
                                        <Link
                                            className="dropdown-item py-2"
                                            to="/userAccount"
                                            onClick={() => { setShowUserDropdown(false); }}
                                        >
                                            <FaUser className="me-2 text-muted" />
                                            Trang cá nhân
                                        </Link>
                                        <Link
                                            className="dropdown-item py-2"
                                            to="/userAccount/orders"
                                            onClick={() => { setShowUserDropdown(false); }}
                                        >
                                            <FaClipboardList className="me-2 text-muted" />
                                            Đơn hàng của tôi
                                        </Link>
                                        <Link
                                            className="dropdown-item py-2"
                                            to="/userAccount/wishlist"
                                            onClick={() => { setShowUserDropdown(false); }}
                                        >
                                            <FaHeart className="me-2 text-muted" />
                                            Sản phẩm yêu thích
                                        </Link>
                                        <div className="dropdown-divider"></div>
                                        <button
                                            className="dropdown-item py-2 text-danger"
                                            onClick={() => {
                                                setShowUserDropdown(false);
                                                handleLogout();
                                            }}
                                        >
                                            <FaSignOutAlt className="me-2" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="d-flex flex-column flex-sm-row">
                                <Link
                                    to="/login"
                                    className="btn btn-outline-primary me-0 me-sm-2 mb-2 mb-sm-0"
                                    style={{ fontSize: "14px", borderRadius: "20px" }}
                                    onClick={() => setExpanded(false)}
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/signup"
                                    className="btn btn-outline-primary"
                                    style={{ fontSize: "14px", borderRadius: "20px" }}
                                    onClick={() => setExpanded(false)}
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop search bar - outside of collapsible area */}
            {showSearch && (
                <div className="container-fluid bg-light py-3 border-top d-none d-lg-block">
                    <div className="container">
                        <div className="input-group">
                            <span className="input-group-text bg-white border-0">
                                <CiSearch size={20} />
                            </span>
                            <input
                                type="text"
                                className="form-control border-0"
                                placeholder="Tìm kiếm trong cửa hàng..."
                                autoFocus
                            />
                            <button className="btn btn-primary" type="button">
                                Tìm kiếm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navigation;