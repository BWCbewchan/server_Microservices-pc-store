import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import Features from "../Home/Features";
import { NavLink, useNavigate } from "react-router-dom";

const LoginForm = () => {
  const navigate = useNavigate();
  return (
    <>
    <div className="container mt-5" style={{ maxWidth: "1279px"  }}>
      {/* Breadcrumb Navigation */}
      <nav className="text-muted mb-4" style={{ fontSize: "14px", fontWeight: 300 }}>
        <span className="text-dark">Home </span>
        <span className="text-primary">›</span>
        <span className="text-dark"> Login</span>
      </nav>

      {/* Page Title */}
      <h1 className="mb-5 text-dark" style={{ fontWeight: 600, fontSize: "36px" }}>Customer Login</h1>

      {/* Main Content */}
      <div className="d-flex gap-5 flex-wrap">
        {/* Registered Customers Section */}
        <form className="flex-grow-1" style={{ maxWidth: "50%" }}>
          <div className=" p-5 shadow-sm" style={{ borderRadius: "12px",backgroundColor:'#F5F7FF' }}>
            <h2 className="text-dark mb-4" style={{ fontWeight: 600, fontSize: "22px" }}>Registered Customers</h2>
            <p className="text-dark mb-4" style={{ fontWeight: 300, fontSize: "16px" }}>
              If you have an account, sign in with your email address.
            </p>

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
                style={{
                  fontWeight: 300,
                  fontSize: "15px",
                  padding: "12px 15px",
                  borderRadius: "8px",
                }}
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
                placeholder="Your Password"
                style={{
                  fontWeight: 300,
                  fontSize: "15px",
                  padding: "12px 15px",
                  borderRadius: "8px",
                }}
                required
              />
            </div>

            {/* Buttons */}
            <div className="d-flex gap-4 align-items-center mt-4">
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  fontSize: "14px",
                  height: '50px',
                  width:'151px',
                  borderRadius: "50px",
                  fontWeight: 600,
                }}
              >
                Sign In
              </button>
              <a href="#" className="text-primary" style={{ fontSize: "16px", fontWeight: 500, textDecoration: "none" }}>
                Forgot Your Password?
              </a>
            </div>
          </div>
        </form>

        {/* New Customer Section */}
        <div className="flex-grow-1" style={{ maxWidth: "50%" }}>
            <div className="  p-5 shadow-sm" style={{ borderRadius: "12px", backgroundColor: '#F5F7FF' }}>
            <h2 className="text-dark mb-4" style={{ fontWeight: 600, fontSize: "22px" }}>New Customer?</h2>
            <p className="text-dark" style={{ fontWeight: 300, fontSize: "16px", marginBottom: "24px" }}>
              Creating an account has many benefits:
              <ul className="mt-3" style={{ paddingLeft: "20px" }}>
                <li className="mb-2">Check out faster</li>
                <li className="mb-2">Keep more than one address</li>
                <li>Track orders and more</li>
              </ul>
            </p>
              <button
                className="btn btn-primary"
                style={{
                  fontSize: "14px",
                  height: '50px',
                  width: '208px',
                  borderRadius: "50px",
                  fontWeight: 600
                }}
                onClick={() => navigate('/signup')}
              >
                Create An Account
              </button>
          </div>
        </div>
      </div>

     
      </div>
      <Features />
    </>
  );
};

export default LoginForm;
