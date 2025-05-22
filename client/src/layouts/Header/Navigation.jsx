import "bootstrap/dist/css/bootstrap.min.css";
import { useContext, useState, useEffect, useRef, useCallback } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { CiSearch } from "react-icons/ci";
import { FiShoppingCart } from "react-icons/fi";
import { FaUser, FaSignOutAlt, FaClipboardList, FaHeart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

const Navigation = () => {
    const [showSearch, setShowSearch] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const navigate = useNavigate();
    const { currentUser, logout } = useContext(AuthContext);
    const dropdownRef = useRef(null);
    const mobileDropdownRef = useRef(null);
    const desktopDropdownRef = useRef(null);
    const searchResultsRef = useRef(null);
    const searchDebounceRef = useRef(null);

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

    // Đóng kết quả tìm kiếm khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
                setSearchResults([]);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Hàm xử lý debounce để tránh gọi API quá nhiều khi nhập
    const debounce = (func, delay) => {
        return function (...args) {
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
            }
            searchDebounceRef.current = setTimeout(() => {
                func.apply(null, args);
            }, delay);
        };
    };

    // Hàm tìm kiếm sản phẩm
    const searchProducts = useCallback(async (term) => {
        if (!term || term.length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
            console.log("Đang tìm kiếm sản phẩm với từ khóa:", term);

            const apiUrl = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/products-search`;
            console.log("API URL:", apiUrl);

            const response = await axios.get(apiUrl, {
                params: { name: term, limit: 5 },
                withCredentials: true
            });

            console.log("Kết quả tìm kiếm:", response.data);

            if (response?.data?.data) {
                setSearchResults(response.data.data);
            } else {
                console.error("Cấu trúc response không đúng:", response.data);
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Lỗi khi tìm kiếm sản phẩm:", error);
            // Chi tiết lỗi để debug
            if (error.response) {
                console.error("Response error data:", error.response.data);
                console.error("Response error status:", error.response.status);
            } else if (error.request) {
                console.error("No response received:", error.request);
            } else {
                console.error("Error message:", error.message);
            }
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Tạo phiên bản debounce của hàm tìm kiếm
    const debouncedSearch = useCallback(
        debounce((term) => {
            searchProducts(term);
        }, 300),
        [searchProducts]
    );

    // Gọi hàm tìm kiếm khi searchTerm thay đổi
    useEffect(() => {
        if (searchTerm) {
            debouncedSearch(searchTerm);
        } else {
            setSearchResults([]);
        }
    }, [searchTerm, debouncedSearch]);

    // Xử lý khi người dùng nhập từ khóa tìm kiếm
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Xử lý khi người dùng chọn một sản phẩm từ kết quả
    const handleSelectProduct = (productId) => {
        navigate(`/details/${productId}`);
        setSearchTerm("");
        setSearchResults([]);
        setShowSearch(false);
        setExpanded(false);
    };

    // Xử lý khi người dùng muốn xem tất cả kết quả tìm kiếm
    const handleViewAllResults = () => {
        if (searchTerm.trim()) {
            navigate(`/catalog?name=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm("");
            setSearchResults([]);
            setShowSearch(false);
            setExpanded(false);
        }
    };

    // Format giá tiền
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(price);
    };

    // Replace the existing categories array with a more comprehensive list
    const categories = [
        { name: "Laptops", value: "MSI Laptops" },
        { name: "Custom Builds", value: "Custome Builds" },
        { name: "Desktop PCs", value: "Desktops" },
        { name: "Gaming Monitors", value: "Gaming Monitors" },
    ];

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white py-2">
            <div className="container">
                {/* Logo replaced with text */}
                <Link className="navbar-brand" to="/">
                    <span style={{
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "black",
                        letterSpacing: "0.5px"
                    }}>
                        PCStore
                    </span>
                </Link>

                {/* Mobile Actions: Search, Cart, User Icon */}
                <div className="d-flex align-items-center order-lg-last ms-auto me-2">
                    <div className="nav-item mx-2">
                        <button
                            className="search-toggle-btn"
                            onClick={() => setShowSearch(!showSearch)}
                            aria-label={showSearch ? "Close search" : "Open search"}
                        >
                            {showSearch ? (
                                <AiOutlineClose size={22} className="search-close-icon" />
                            ) : (
                                <CiSearch size={24} />
                            )}
                        </button>
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
                            <div className="search-container" ref={searchResultsRef}>
                                <div className="search-input-wrapper">
                                    <CiSearch className="search-icon" size={20} />
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Tìm kiếm sản phẩm..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        autoFocus
                                    />
                                    {searchTerm && (
                                        <button
                                            className="search-clear-btn"
                                            onClick={() => setSearchTerm("")}
                                            aria-label="Clear search"
                                        >
                                            <AiOutlineClose size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* Kết quả tìm kiếm trên mobile */}
                                {searchResults.length > 0 && (
                                    <div className="search-results-dropdown">
                                        <div className="search-results-header">
                                            <small>Gợi ý sản phẩm</small>
                                        </div>
                                        <div className="search-results-list">
                                            {searchResults.map((product) => (
                                                <div
                                                    key={product._id}
                                                    className="search-result-item"
                                                    onClick={() => handleSelectProduct(product._id)}
                                                >
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="search-result-image"
                                                    />
                                                    <div className="search-result-info">
                                                        <div className="search-result-name">{product.name}</div>
                                                        <div className="search-result-price">
                                                            {formatPrice(product.price)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div
                                            className="search-results-footer"
                                            onClick={handleViewAllResults}
                                        >
                                            Xem tất cả kết quả
                                        </div>
                                    </div>
                                )}

                                {/* Hiển thị đang tìm kiếm */}
                                {isSearching && searchTerm && (
                                    <div className="search-loading">
                                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                                            <span className="visually-hidden">Đang tìm kiếm...</span>
                                        </div>
                                        <span>Đang tìm kiếm...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Category Links - Updated with query parameters for filtering */}
                    <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
                        {categories.map((category, index) => (
                            <li className="nav-item" key={index}>
                                <Link
                                    className="nav-link"
                                    to={`/catalog?category=${encodeURIComponent(category.value)}`}
                                    onClick={() => setExpanded(false)}
                                >
                                    {category.name}
                                </Link>
                            </li>
                        ))}
                        <li className="nav-item">
                            <Link
                                className="nav-link fw-bold text-primary"
                                to="/catalog"
                                onClick={() => setExpanded(false)}
                            >
                                All Products
                            </Link>
                        </li>
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

            {/* Desktop search overlay - full width */}
            {showSearch && (
                <div className="search-overlay">
                    <div className="container">
                        <div className="search-container-desktop" ref={searchResultsRef}>
                            <div className="search-input-wrapper">
                                <CiSearch className="search-icon" size={24} />
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Nhập từ khóa tìm kiếm..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    autoFocus
                                />
                                {searchTerm && (
                                    <button
                                        className="search-clear-btn"
                                        onClick={() => setSearchTerm("")}
                                        aria-label="Clear search"
                                    >
                                        <AiOutlineClose size={20} />
                                    </button>
                                )}
                                <button
                                    className="search-button"
                                    onClick={handleViewAllResults}
                                    disabled={!searchTerm.trim()}
                                >
                                    Tìm kiếm
                                </button>
                            </div>

                            {/* Kết quả tìm kiếm trên desktop */}
                            {searchResults.length > 0 && (
                                <div className="search-results-dropdown search-results-desktop">
                                    <div className="search-results-header">
                                        <small>Tìm thấy {searchResults.length} sản phẩm</small>
                                    </div>
                                    <div className="search-results-list">
                                        {searchResults.map((product) => (
                                            <div
                                                key={product._id}
                                                className="search-result-item"
                                                onClick={() => handleSelectProduct(product._id)}
                                            >
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="search-result-image search-result-image-lg"
                                                />
                                                <div className="search-result-info">
                                                    <div className="search-result-name">{product.name}</div>
                                                    <div className="search-result-price">
                                                        {formatPrice(product.price)}
                                                    </div>
                                                </div>
                                                <div className="search-result-stock">
                                                    <span className={`search-result-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                                        {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div
                                        className="search-results-footer"
                                        onClick={handleViewAllResults}
                                    >
                                        Xem tất cả kết quả
                                    </div>
                                </div>
                            )}

                            {/* Hiển thị đang tìm kiếm */}
                            {isSearching && searchTerm && (
                                <div className="search-loading">
                                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                                        <span className="visually-hidden">Đang tìm kiếm...</span>
                                    </div>
                                    <span>Đang tìm kiếm...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navigation;