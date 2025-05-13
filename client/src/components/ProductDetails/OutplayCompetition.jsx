import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function OutplayCompetition() {
  // Style cho toàn section
  const sectionStyle = {
    backgroundColor: "#000",           // Nền đen
    color: "#fff",                     // Chữ trắng
    borderTop: "1px solid #2B2B2B",    // Đường viền mờ phía trên
    borderBottom: "1px solid #2B2B2B", // Đường viền mờ phía dưới
    position: "relative",              // Để đặt pagination dots ở góc
    overflow: "hidden",                // Phòng trường hợp ảnh bị tràn
  };

  // Style cho khối chứa nội dung
  const containerStyle = {
    padding: "40px 80px",             // Khoảng trống trên-dưới và hai bên
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",  // Chia đều không gian cho text & ảnh
  };

  // Style cho phần text bên trái
  const leftContentStyle = {
    maxWidth: "450px", // Giới hạn độ rộng text
  };

  // Style cho tiêu đề
  const headingStyle = {
    fontSize: "36px",
    fontWeight: 500,
    marginBottom: "20px",
  };

  // Style cho đoạn mô tả
  const paragraphStyle = {
    fontSize: "16px",
    lineHeight: "24px",
    marginBottom: "20px",
  };

  // Style cho ảnh CPU bên phải
  const imageStyle = {
    maxWidth: "600px",
    width: "100%",
    height: "auto",
  };

  // Style cho cụm 3 chấm (pagination) ở góc dưới trái
  const paginationStyle = {
    position: "absolute",
    bottom: "20px",
    left: "50px",
    display: "flex",
    gap: "8px",
  };

  // Style cơ bản cho từng chấm
  const dotStyle = {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#fff",
    opacity: 0.3, // chấm mờ
  };

  // Style cho chấm đang active
  const activeDotStyle = {
    ...dotStyle,
    opacity: 1, // chấm rõ
  };

  return (
    <div style={sectionStyle}>
      <div style={containerStyle}>
        {/* Cột trái: text */}
        <div style={leftContentStyle}>
          <h1 style={headingStyle}>Outplay the Competition</h1>
          <p style={paragraphStyle}>
            Experience a 40% boost in computing from last generation. MSI
            Desktop equips the 10th Gen. Intel® Core™ i7 processor with the
            utmost computing power to bring you an unparalleled gaming
            experience.
            <br />
            <br />
            *Performance compared to i7-9700. Specs varies by model.
          </p>
        </div>

        {/* Cột phải: ảnh CPU */}
        <div>
          <img
            style={imageStyle}
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/c4f31811cef9ac06fb24f7bb3e050667cf9ba03a8f0583b99ebbba06c7f605f8"
            alt="MSI gaming desktop"
          />
        </div>
      </div>

      {/* Pagination Dots (3 chấm) */}
      <div style={paginationStyle}>
        <div style={activeDotStyle}></div>
        <div style={dotStyle}></div>
        <div style={dotStyle}></div>
      </div>
    </div>
  );
}

export default OutplayCompetition;
