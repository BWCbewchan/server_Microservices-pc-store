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