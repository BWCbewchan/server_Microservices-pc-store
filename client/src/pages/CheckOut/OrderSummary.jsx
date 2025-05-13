import React from "react";

const OrderSummary = ({ items, subtotal, shippingFee, finalTotal }) => {
    if (!items || items.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "20px" }}>
                <h2>No items selected!</h2>
            </div>
        );
    }
    const totalProducts = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <div
            style={{
                backgroundColor: "#F5F7FF",
                display: "flex",
                flexDirection: "column",
                padding: "18px 31px 29px",
                maxWidth: "550px",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                height: "100%"
            }}
            className="container"
        >
            <h2 style={{ color: "#000", fontWeight: "600", fontSize: "24px", marginBottom: "20px" }}>
                Order Summary
            </h2>

            {/* Danh sách sản phẩm */}
            {items.map((item) => (
                <div
                    key={item.productId}
                    style={{
                        display: "flex",
                        gap: "15px",
                        borderBottom: "1px solid #E2E2E2",
                        paddingBottom: "15px",
                        marginTop: "25px"
                    }}
                >
                    <img
                        src={item.image || "https://via.placeholder.com/62"}
                        alt="Product Image"
                        style={{ width: "62px", objectFit: "contain" }}
                    />
                    <div style={{ flex: 1 }}>
                        <div style={{ color: "#000", fontWeight: "500" }}>{item.name}</div>
                        <div style={{ marginTop: "6px", fontWeight: "600" }}>
                            Qty: {item.quantity} x{" "}
                            {item.price.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND"
                            })}
                        </div>
                    </div>
                </div>
            ))}

            {/* Tóm tắt số tiền */}
            <div style={{ marginTop: "20px", fontSize: "14px", color: "#000" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span>Products Total:</span>
                    <span>
                        {totalProducts.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                    </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span>Shipping Fee:</span>
                    <span>
                        {shippingFee.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                    </span>
                </div>
            </div>

            <div
                style={{
                    display: "flex",
                    marginTop: "20px",
                    justifyContent: "space-between",
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#000",
                    paddingTop: "10px",
                    borderTop: "1px solid #E2E2E2"
                }}
            >
                <span>Final Total:</span>
                <span>
                    {finalTotal.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                </span>
            </div>
        </div>
    );
};

export default OrderSummary;
