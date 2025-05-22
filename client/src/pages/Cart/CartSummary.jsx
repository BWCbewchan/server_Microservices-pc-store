import { useNavigate } from "react-router-dom";

const CartSummary = ({ subtotal, total, selectedCartItems }) => {
  const navigate = useNavigate();

  const formatPrice = (value) => {
    // Chuyển đổi giá trị thành số
    const numValue = Number(value);

    // Kiểm tra nếu không phải số hợp lệ
    if (isNaN(numValue) && numValue !== 0) {
      return "Liên hệ";
    }

    // Định dạng theo tiền Việt Nam
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true // Đảm bảo sử dụng dấu phân cách hàng nghìn
    }).format(numValue);
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
        <div style={{ fontSize: "24px", fontWeight: "600" }}>Tóm tắt</div>
      </div>
      <div style={{ fontSize: "14px", color: "#666" }}>
        Nhập địa chỉ của bạn để nhận ước tính phí vận chuyển.
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div style={{ fontSize: "14px", lineHeight: "2" }}>
          <div>Tạm tính</div>
          <div style={{ fontWeight: "600", marginTop: "10px" }}>Tổng đơn hàng</div>
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
        Tiến hành thanh toán
      </button>
    </div>
  );
};

export default CartSummary;
