import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
const CartSummary = ({ subtotal,   total, selectedCartItems }) => {
    const navigate = useNavigate();
    const handleCheckout = () => {
        if (selectedCartItems.length === 0) {
            toast.warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
            return;
        }
        navigate("/checkout", { state: { selectedCartItems, subtotal,   total } });
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
                    <div>Shipping</div>
                    <div>Tax</div>
                    <div style={{ fontWeight: "600", marginTop: "10px" }}>Order Total</div>
                </div>
                <div style={{ fontSize: "14px", textAlign: "right", lineHeight: "2" }}>
                    <div>${subtotal.toFixed(2)}</div>
                    {/* <div>${shipping.toFixed(2)}</div>
                    <div>${tax.toFixed(2)}</div> */}
                    <div style={{ fontWeight: "600", fontSize: "18px", marginTop: "10px" }}>
                        ${total.toFixed(2)}
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
            >
                Proceed to Checkout
            </button>

            <button
                style={{
                    width: "100%",
                    padding: "15px",
                    borderRadius: "25px",
                    backgroundColor: "rgba(255, 184, 0, 1)",
                    color: "#232C65",
                    fontSize: "16px",
                    fontWeight: "600",
                    marginBottom: "10px",
                    cursor: "pointer",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <span>Check out with</span>
                <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/573ae1820b9bad5021370bf2854f6408aba211f51c6be7c1f5041e70240dde38"
                    alt="PayPal"
                    style={{
                        marginLeft: "10px",
                        width: "50px",
                        height: "auto",
                    }}
                />
            </button>

            <button
                style={{
                    width: "100%",
                    padding: "15px",
                    borderRadius: "25px",
                    border: "2px solid #A2A6B0",
                    backgroundColor: "transparent",
                    color: "#A2A6B0",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                }}
            >
                Check Out with Multiple Addresses
            </button>
        </div>
    );
};


export default CartSummary;
