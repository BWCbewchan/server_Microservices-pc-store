import React, { useState } from "react";
import CheckoutForm from "./CheckoutForm";
import OrderSummary from "./OrderSummary";
import { useLocation, useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy dữ liệu từ state (điều này được truyền từ giỏ hàng)
  const { selectedCartItems, subtotal, shipping, tax, total } = location.state || {};
  if (!location.state) {
    navigate("/cart");
    return null;
  }

  // Nâng state shippingMethod lên để tính phí ship và final total
  const [shippingMethod, setShippingMethod] = useState("standard");
  // Nếu bạn muốn sử dụng đơn vị VND thì giá ship được tính theo số nguyên, ví dụ:
  const shippingFees = { standard: 30000, express: 50000 };
  const shippingFee = shippingFees[shippingMethod] || 0;
  // finalTotal = tổng tiền sản phẩm + phí ship (có thể cộng tax nếu cần)
  const finalTotal = subtotal + shippingFee;

  return (
    <div style={{ backgroundColor: "#FFF", margin: "30px 0" }}>
      <main
        style={{
          alignSelf: "center",
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          width: "100%",
          maxWidth: "1400px"
        }}
        className="container"
      >
        <nav aria-label="Breadcrumb">
          <div style={{ textAlign: "center", font: "300 12px Poppins, sans-serif", color: "#A3A3A3" }}>
            <span style={{ fontWeight: "400", color: "#000" }}>Home </span>
            <span style={{ fontWeight: "400", color: "#0156FF" }}>›</span>
            <span style={{ fontWeight: "400", color: "#000" }}> Shopping Cart </span>
            <span style={{ fontWeight: "400", color: "#0156FF" }}>›</span>
            <span style={{ fontWeight: "400", color: "#000" }}> Checkout Process</span>
          </div>
        </nav>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            justifyContent: "space-between"
          }}
        >
          <CheckoutForm
            selectedItems={selectedCartItems}
            shippingMethod={shippingMethod}
            setShippingMethod={setShippingMethod}
            subtotal={subtotal}
            finalTotal={finalTotal}
          />
          <OrderSummary
            items={selectedCartItems}
            subtotal={subtotal}
            shippingFee={shippingFee}
            finalTotal={finalTotal}
          />
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
