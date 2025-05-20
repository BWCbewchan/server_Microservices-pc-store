import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import { FiPhone, FiClock } from "react-icons/fi";
import { FaMapMarkerAlt } from "react-icons/fa";
import { AiFillFacebook, AiFillInstagram } from "react-icons/ai";
import "../../styles/Navigation.css";
import "../../styles/SearchStyles.css"; // Import search styles

const Header = () => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div>
      {/* Top Header Bar */}
      <header className="bg-dark text-white py-2 d-none d-md-block">
        <div className="container">
          {/* Large screen layout - shows all elements */}
          <div className="d-none d-lg-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FiClock className="me-2" />
              <span className="small">Mon-Thu: 9:00 AM - 5:30 PM</span>
            </div>

            <div className="d-flex align-items-center">
              <FaMapMarkerAlt className="me-2" />
              <span className="small">
                Visit our showroom in 1234 Street Address City Address, 1234
              </span>
            </div>

            <div className="d-flex align-items-center">
              <div className="me-3">
                <FiPhone className="me-1" />
                <span className="small">Call Us: (00) 1234 5678</span>
              </div>
              <div className="d-flex gap-2">
                <AiFillFacebook size={18} />
                <AiFillInstagram size={18} />
              </div>
            </div>
          </div>

          {/* Medium screen layout - simplified */}
          <div className="d-none d-md-flex d-lg-none justify-content-between align-items-center">
            <div className="d-flex align-items-center small">
              <FiClock className="me-2" />
              <span>9:00 AM - 5:30 PM</span>
            </div>

            <div className="d-flex align-items-center small">
              <FiPhone className="me-1" />
              <span>Call: (00) 1234 5678</span>
            </div>

            <div className="d-flex gap-2">
              <AiFillFacebook size={16} />
              <AiFillInstagram size={16} />
            </div>
          </div>

          {/* Small screen layout - minimal */}
          <div className="d-flex d-md-none justify-content-between align-items-center">
            <span className="small">
              <FiPhone className="me-1" />
              (00) 1234 5678
            </span>

            <div className="d-flex gap-2">
              <AiFillFacebook size={16} />
              <AiFillInstagram size={16} />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar - Sticky on scroll */}
      <div
        className={`navigation-wrapper ${isSticky ? "sticky-top shadow-sm" : ""
          }`}
        style={{
          transition: "all 0.3s ease",
          backgroundColor: "#fff",
        }}
      >
        <Navigation />
      </div>
    </div>
  );
};

export default Header;