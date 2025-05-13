import React from "react";

const BreadcrumbNav = () => {
  return (
    <nav className="container mt-5 ms-5">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item">Home</li>
          <li className="breadcrumb-item active" aria-current="page">
            About Us
          </li>
        </ol>
      </nav>
      <h1 className="mt-3 fw-semibold">About Us</h1>
    </nav>
  );
};

export default BreadcrumbNav;
