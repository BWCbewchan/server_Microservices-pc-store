import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Features from "../Home/Features";
import { NavLink } from "react-router-dom";

const RegisterForm = () => {
  return (
    <>
      <div className="container mt-5" style={{ maxWidth: "1279px" }}>
        {/* Breadcrumb Navigation */}
        <nav className="text-muted mb-4" style={{ fontSize: "14px", fontWeight: 300 }}>
          <span className="text-dark">Home </span>
          <span className="text-primary">›</span>
          <span className="text-dark"> Register</span>
        </nav>

        {/* Page Title */}
        <h1 className="mb-5 text-dark" style={{ fontWeight: 600, fontSize: "36px" }}>
          Customer Registration
        </h1>

        {/* Main Content */}
        <form className="p-5 shadow-sm" style={{ borderRadius: "12px", backgroundColor: '#F5F7FF' }}>
          <h2 className="text-dark mb-4" style={{ fontWeight: 600, fontSize: "22px" }}>
            Create New Account
          </h2>

          {/* Full Name Input */}
          <div className="mb-4">
            <label htmlFor="fullName" className="form-label text-dark" style={{ fontSize: "16px", fontWeight: 600 }}>
              Full Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              className="form-control"
              placeholder="Your Full Name"
              style={{ fontWeight: 300, fontSize: "15px", padding: "12px 15px", borderRadius: "8px" }}
              required
            />
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <label htmlFor="email" className="form-label text-dark" style={{ fontSize: "16px", fontWeight: 600 }}>
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="Your Email"
              style={{ fontWeight: 300, fontSize: "15px", padding: "12px 15px", borderRadius: "8px" }}
              required
            />
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label htmlFor="password" className="form-label text-dark" style={{ fontSize: "16px", fontWeight: 600 }}>
              Password <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="Create Password"
              style={{ fontWeight: 300, fontSize: "15px", padding: "12px 15px", borderRadius: "8px" }}
              required
            />
          </div>

          {/* Confirm Password Input */}
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="form-label text-dark" style={{ fontSize: "16px", fontWeight: 600 }}>
              Confirm Password <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="form-control"
              placeholder="Confirm Password"
              style={{ fontWeight: 300, fontSize: "15px", padding: "12px 15px", borderRadius: "8px" }}
              required
            />
          </div>

          {/* Checkbox Agree to Terms */}
          <div className="mb-4">
            <input
              type="checkbox"
              id="terms"
              required
              style={{ marginRight: "10px" }}
            />
            <label htmlFor="terms" className="text-dark" style={{ fontSize: "14px", fontWeight: 500 }}>
              I agree to the Terms and Conditions
            </label>
          </div>

          {/* Register Button */}
          <div className="d-flex gap-4 align-items-center mt-4">
            <button
              type="submit"
              className="btn btn-primary"
              style={{ fontSize: "14px", height: '50px', width: '208px', borderRadius: "50px", fontWeight: 600 }}
            >
              Register
            </button>
            <a href="#" className="text-primary" style={{ fontSize: "16px", fontWeight: 500, textDecoration: "none" }}>
              Already have an account?  <NavLink to="/login">Sign-In</NavLink>
            </a>
          </div>
        </form>
      </div>
      <Features />
    </>
  );
};

export default RegisterForm;
