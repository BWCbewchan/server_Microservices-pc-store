import React, { useState } from "react";
import FooterLinkItem from "./FooterLinkItem";
import { Link } from "react-router-dom";

const Footer = () => {
  const [email, setEmail] = useState("");

  // Footer link groups
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

  // Handle newsletter subscription
  const handleSubscribe = (e) => {
    e.preventDefault();
    // Add subscription logic here
    console.log("Subscribing email:", email);
    setEmail("");
    // You could add a toast notification here
  };

  // Render a footer section with collapsible behavior on mobile
  const FooterSection = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleSection = () => setIsOpen(!isOpen);

    return (
      <div className="mb-4">
        {/* Section header with toggle button on mobile */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="text-white mb-0 fs-6 fw-semibold">{title}</h5>
          <button
            className="btn btn-link p-0 d-md-none text-white"
            onClick={toggleSection}
            aria-label={`Toggle ${title} section`}
          >
            {isOpen ? "−" : "+"}
          </button>
        </div>

        {/* Section content - always visible on desktop, toggleable on mobile */}
        <div className={`${isOpen ? "d-block" : "d-none"} d-md-block`}>
          {children}
        </div>
      </div>
    );
  };

  return (
    <footer className="bg-dark text-white pt-4 pb-3">
      {/* Newsletter Section - Full width on all devices */}
      <div className="container mb-4">
        <div className="row justify-content-center text-center">
          <div className="col-12 col-lg-8">
            <h2 className="fs-4 fw-semibold mb-2">
              Sign Up To Our Newsletter.
            </h2>
            <p className="mb-3">Be the first to hear about the latest offers.</p>

            <form onSubmit={handleSubscribe} className="newsletter-form">
              <div className="row g-2 justify-content-center">
                <div className="col-12 col-sm-8 col-lg-7">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your Email"
                    className="form-control bg-dark text-white border-white rounded-pill px-3 py-2"
                    required
                  />
                </div>
                <div className="col-12 col-sm-4 col-lg-5">
                  <button
                    type="submit"
                    className="btn btn-primary w-100 rounded-pill py-2 fw-medium"
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Sections */}
      <div className="container">
        <div className="row">
          {/* Links Sections - Using FooterSection component */}
          {Object.entries(footerLinks).map(([groupTitle, links]) => (
            <div className="col-12 col-sm-6 col-lg-3" key={groupTitle}>
              <FooterSection title={groupTitle}>
                <ul className="list-unstyled mb-0">
                  {links.map((item, index) => (
                    <li key={index} className="mb-2">
                      <Link
                        to={item.link}
                        className="text-white-50 text-decoration-none"
                        style={{ fontSize: "0.9rem" }}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </FooterSection>
            </div>
          ))}

          {/* Address Section */}
          <div className="col-12 col-lg-3 mt-3 mt-lg-0">
            <FooterSection title="Address">
              <address
                className="mb-0 text-white-50"
                style={{ fontSize: "0.9rem" }}
              >
                <p className="mb-1">Address: 1234 Street Address, City Address, 1234</p>
                <p className="mb-1">
                  Phones:{" "}
                  <a
                    href="tel:0012345678"
                    className="text-primary text-decoration-none"
                  >
                    (00) 1234 5678
                  </a>
                </p>
                <p className="mb-0">
                  Email:{" "}
                  <a
                    href="mailto:shop@email.com"
                    className="text-primary text-decoration-none"
                  >
                    shop@email.com
                  </a>
                </p>
              </address>
            </FooterSection>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="container-fluid border-top border-secondary mt-4 pt-3">
        <div className="row">
          <div className="col-12 text-center">
            <p className="text-muted small mb-0">
              Copyright © 2025 Solomon Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
