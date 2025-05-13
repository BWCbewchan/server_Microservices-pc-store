import React from "react";
import FooterLinkItem from "./FooterLinkItem"; // Đảm bảo đường dẫn chính xác

const Footer = () => {
  // Các nhóm link khác...
  const footerLinks = {
    Information: [
      { name: "About Us", link: "/about-us" },
      { name: "About Zip", link: "/about-zip" },
      { name: "Privacy Policy", link: "/privacy-policy" },
      { name: "Search", link: "/search" },
      { name: "Terms", link: "/terms" },
      { name: "Orders and Returns", link: "/orders-returns" },
      { name: "Contact Us", link: "/contact-us" },
      { name: "Advanced Search", link: "/advanced-search" },
      { name: "Newsletter Subscription", link: "/newsletter" },
    ],
    "PC Parts": [
      { name: "CPUs", link: "/cpus" },
      { name: "Add On Cards", link: "/add-on-cards" },
      { name: "Hard Drives (Internal)", link: "/hard-drives" },
      { name: "Graphic Cards", link: "/graphic-cards" },
      { name: "Keyboards / Mice", link: "/keyboards-mice" },
      { name: "Cases / Power Supplies / Cooling", link: "/cases-power-supplies-cooling" },
      { name: "RAM (Memory)", link: "/ram-memory" },
      { name: "Software", link: "/software" },
      { name: "Speakers / Headsets", link: "/speakers-headsets" },
      { name: "Motherboards", link: "/motherboards" },
    ],
    "Desktop PCs": [
      { name: "Custom PCs", link: "/custom-pcs" },
      { name: "Servers", link: "/servers" },
      { name: "MSI All-In-One PCs", link: "/msi-all-in-one-pcs" },
      { name: "HP/Compaq PCs", link: "/hp-compaq-pcs" },
      { name: "ASUS PCs", link: "/asus-pcs" },
      { name: "Tecs PCs", link: "/tecs-pcs" },
    ],
    Laptops: [
      { name: "Everyday Use Notebooks", link: "/everyday-notebooks" },
      { name: "MSI Workstation Series", link: "/msi-workstation" },
      { name: "MSI Prestige Series", link: "/msi-prestige" },
      { name: "Tablets and Pads", link: "/tablets-pads" },
      { name: "Netbooks", link: "/netbooks" },
      { name: "Infinity Gaming Notebooks", link: "/infinity-gaming" },
    ],
  };

  return (
    <footer
      style={{
        backgroundColor: "#000",
        padding: "10px 20px",
        color: "white",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* Newsletter Section */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          textAlign: "center",
          marginBottom: "40px",
        }}
      >
        <h2 style={{ fontSize: "28px", fontWeight: "600", marginBottom: "10px" }}>
          Sign Up To Our Newsletter.
        </h2>
        <p style={{ fontSize: "16px", marginBottom: "20px" }}>
          Be the first to hear about the latest offers.
        </p>
        <form
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="email"
            placeholder="Your Email"
            style={{
              padding: "10px 20px",
              borderRadius: "30px",
              border: "1px solid #fff",
              backgroundColor: "#000",
              color: "white",
              fontSize: "14px",
              width: "250px",
              maxWidth: "100%",
            }}
            required
          />
          <button
            type="submit"
            style={{
              backgroundColor: "#0156FF",
              color: "white",
              padding: "10px 25px",
              borderRadius: "30px",
              border: "none",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Subscribe
          </button>
        </form>
      </div>

      {/* Footer Links */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          gap: "30px",
          justifyContent: "space-between",
          marginBottom: "30px",
        }}
      >
        {Object.entries(footerLinks).map(([groupTitle, links]) => (
          <div key={groupTitle} style={{ flex: "1", minWidth: "200px" }}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "10px",
              }}
            >
              {groupTitle}
            </h3>
            {/* Các mục khác... */}
            {links.map((item, index) => (
              <FooterLinkItem key={index} name={item.name} link={item.link} />
            ))}
          </div>
        ))}
        {/* Address Section */}
        <div style={{ flex: "1", minWidth: "200px" }}>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "10px",
            }}
          >
            Address
          </h3>
          <p style={{ fontSize: "14px", lineHeight: "1.8" }}>
            Address: 1234 Street Address, City Address, 1234 <br />
            Phones:{" "}
            <a
              href="tel:0012345678"
              style={{ color: "#0156FF", textDecoration: "none" }}
            >
              (00) 1234 5678
            </a>
            <br />
            Email:{" "}
            <a
              href="mailto:shop@email.com"
              style={{ color: "#0156FF", textDecoration: "none" }}
            >
              shop@email.com
            </a>
          </p>
        </div>
      </div>

      {/* Footer Bottom */}
      <div
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.2)",
          paddingTop: "20px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "14px", color: "#888" }}>
          Copyright © 2025 Solomon Team
        </p>
      </div>
    </footer>
  );
};

export default Footer;
