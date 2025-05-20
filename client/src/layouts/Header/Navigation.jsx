import React, { useState } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import { AiOutlineClose } from "react-icons/ai";
import { BiUser } from "react-icons/bi";
import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "../../assets/images/logo.png";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/Navigation.css"

const Navigation = () => {
    const [showSearch, setShowSearch] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const navigate = useNavigate();
    const categories = [
        "Laptops",
        "Desktop PCs",
        "Networking Devices",
        "Printers & Scanners",
        "PC Parts",
        "All Other Products",
        "Repairs",
    ];

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);
        // Close search if open when toggling menu
        if (showSearch) setShowSearch(false);
    };

    const toggleSearch = () => {
        setShowSearch(!showSearch);
        // Close mobile menu if open when toggling search
        if (showMobileMenu) setShowMobileMenu(false);
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white py-2 shadow-sm">
            <div className="container">
                {/* Logo */}
                <Link to="/" className="navbar-brand me-0 me-lg-3 nav-logo">
                    <img
                        src={Logo}
                        alt="Logo"
                        style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "contain",
                            cursor: "pointer"
                        }}
                    />
                </Link>

                {/* Mobile Buttons */}
                <div className="d-flex align-items-center ms-auto order-lg-last">
                    <button
                        className="btn btn-link p-1 me-2 d-lg-none nav-icon"
                        onClick={toggleSearch}>
                        {showSearch ? <AiOutlineClose size={22} /> : <CiSearch size={22} />}
                    </button>

                    <button
                        className="btn btn-link p-1 me-2 nav-icon"
                        onClick={() => navigate('/cart')}>
                        <FiShoppingCart size={22} />
                    </button>

                    <div className="d-none d-lg-flex">
                        <button
                            className="btn btn-outline-primary rounded-pill me-2 nav-auth-btn"
                            onClick={() => navigate('/login')}>
                            Đăng nhập
                        </button>
                        <button
                            className="btn btn-outline-primary rounded-pill nav-auth-btn"
                            onClick={() => navigate('/signup')}>
                            Đăng ký
                        </button>
                    </div>

                    {/* Mobile Auth Dropdown */}
                    <div className="dropdown d-lg-none">
                        <button
                            className="btn btn-link p-1 nav-icon"
                            type="button"
                            id="authDropdown"
                            data-bs-toggle="dropdown"
                            aria-expanded="false">
                            <BiUser size={22} />
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="authDropdown">
                            <li><button className="dropdown-item nav-dropdown-item" onClick={() => navigate('/login')}>Đăng nhập</button></li>
                            <li><button className="dropdown-item nav-dropdown-item" onClick={() => navigate('/signup')}>Đăng ký</button></li>
                        </ul>
                    </div>

                    {/* Hamburger Menu Toggle */}
                    <button
                        className="navbar-toggler border-0 ms-2 nav-toggler"
                        type="button"
                        onClick={toggleMobileMenu}
                        aria-expanded={showMobileMenu ? "true" : "false"}
                        aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                </div>

                {/* Search Bar - Full Width on Mobile when active */}
                {showSearch && (
                    <div className="search-overlay position-absolute start-0 px-3 py-2 bg-white w-100" style={{ top: "100%", zIndex: 1000 }}>
                        <div className="d-flex align-items-center border rounded">
                            <CiSearch size={20} className="ms-2" />
                            <input
                                type="text"
                                placeholder="Search entire store here..."
                                className="form-control border-0 shadow-none"
                                autoFocus
                            />
                        </div>
                    </div>
                )}

                {/* Categories Navigation - Collapsible */}
                <div className={`collapse navbar-collapse ${showMobileMenu ? 'show' : ''}`} id="navbarCategories">
                    <ul className="navbar-nav mx-auto">
                        {categories.map((category, index) => (
                            <li className="nav-item" key={index}>
                                <Link
                                    to="/catalog"
                                    className="nav-link px-3 fw-semibold nav-category-link"
                                >
                                    {category}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Search Icon - Desktop Only */}
                    <div className="d-none d-lg-flex">
                        {!showSearch ? (
                            <button className="btn btn-link nav-icon" onClick={toggleSearch}>
                                <CiSearch size={22} />
                            </button>
                        ) : (
                            <button className="btn btn-link nav-icon" onClick={toggleSearch}>
                                <AiOutlineClose size={22} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
