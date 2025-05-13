import React, { useState, useEffect } from "react";
import Navigation from "./Navigation";
import { FiShoppingCart } from "react-icons/fi";

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
      <header className="bg-dark text-white d-flex flex-column align-items-center py-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-5">
          <div className="d-flex gap-3 align-items-center">
            <div className="flex-grow-1">Mon-Thu: 9:00 AM - 5:30 PM</div>
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/70122338c4f8b9fbc27c3c2fa943264aadc19470f1829739d971828944e51456?placeholderIfAbsent=true&apiKey=82af7f18abca424f9dafe2b7f0433a3e"
              alt=""
              className="img-fluid"
              style={{ width: "16px", objectFit: "contain" }}
            />
          </div>

          <div className="d-flex align-items-center mt-2 gap-4">
            <span className="">
              Visit our showroom in 1234 Street Address City Address, 1234
            </span>
            <div className="d-flex flex-column align-items-center mt-2">
              <span>Contact Us</span>
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/412b8bf4e091415e1b80f6f19ef50c432c93c9f4914bef9ea6ea1e42ae365b7d?placeholderIfAbsent=true&apiKey=82af7f18abca424f9dafe2b7f0433a3e"
                alt=""
                className="img-fluid"
                style={{ width: "69px", objectFit: "contain" }}
              />
            </div>
          </div>

          <div className="d-flex gap-3 text-center">
            <div className="flex-grow-1">Call Us: (00) 1234 5678</div>
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/d92b3bc2d46dd318876b6ab34a06229309543bc9ba202265c4c42e9df27e47df?placeholderIfAbsent=true&apiKey=82af7f18abca424f9dafe2b7f0433a3e"
              alt=""
              className="img-fluid"
              style={{ width: "20px", objectFit: "contain" }}
            />
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/da6579f57118492c480f0f5271ff6e8cfba343be79823a662e9a13c4ee20af93?placeholderIfAbsent=true&apiKey=82af7f18abca424f9dafe2b7f0433a3e"
              alt=""
              className="img-fluid"
              style={{ width: "20px", objectFit: "contain" }}
            />
          </div>
        </div>
      </header>
      <div
        style={{
          position: isSticky ? "fixed" : "static",
          top: isSticky ? "0" : "auto",
          width: "100%",
          zIndex: isSticky ? "1000" : "auto",
        }}
      >
        <Navigation />
      </div>
    </div>
  );
};

export default Header;