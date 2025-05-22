import React from "react";
import { useNavigate } from "react-router-dom";

const CartSummary = ({ subtotal, total, selectedCartItems }) => {
  const navigate = useNavigate();

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const handleCheckout = () => {
    if (selectedCartItems.length === 0) {
      alert("Please select items to checkout");
      return;
    }

    navigate("/checkout", {
      state: {
        selectedCartItems,
        subtotal,
        total
      }
    });
  };

  return (
    <div
      style={{
        backgroundColor: "#F5F7FF",
        width: "90%",
        margin: "20px auto",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: "24px", fontWeight: "600" }}>Summary</div>
      </div>
      <div style={{ fontSize: "14px", color: "#666" }}>
        Enter your destination to get a shipping estimate.
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div style={{ fontSize: "14px", lineHeight: "2" }}>
          <div>Subtotal</div>
          <div style={{ fontWeight: "600", marginTop: "10px" }}>Order Total</div>
        </div>
        <div style={{ fontSize: "14px", textAlign: "right", lineHeight: "2" }}>
          <div>{formatPrice(subtotal)}</div>
          <div style={{ fontWeight: "600", fontSize: "18px", marginTop: "10px" }}>
            {formatPrice(total)}
          </div>
        </div>
      </div>

      <button
        style={{
          width: "100%",
          padding: "15px",
          borderRadius: "25px",
          backgroundColor: "#0156FF",
          color: "#FFF",
          fontSize: "16px",
          fontWeight: "600",
          marginBottom: "10px",
          cursor: "pointer",
          border: "none",
        }}
        onClick={handleCheckout}
        disabled={selectedCartItems.length === 0}
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

export default CartSummary;
