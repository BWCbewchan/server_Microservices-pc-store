import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function ImageDisplay() {
    // Thay vì containerStyles với media query,
    // ta sẽ dùng Bootstrap classes: d-flex flex-column align-items-start
    // Nếu cần padding riêng cho mobile, có thể dùng p-3, p-md-0, v.v.
    const containerStyle = {
        // Nếu muốn "padding-right: 20px" khi dưới 991px,
        // ta không thể áp dụng trực tiếp inline media query.
        // Có thể cân nhắc p-3 (padding 1rem) cho mobile,
        // hoặc viết CSS riêng.
    };

    // Thay thế imageWrapperStyles
    const imageWrapperStyle = {
        backgroundColor: "#F5F7FF", // fallback cho var(--Color---1, #F5F7FF)
        display: "flex",
        width: "100%",
        maxWidth: "100%",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 80px",
    };

    // Thay thế imageStyles
    const imageStyle = {
        // aspect-ratio chưa hỗ trợ rộng rãi trên mọi trình duyệt khi dùng inline style
        aspectRatio: "2.14",
        objectFit: "contain",
        objectPosition: "center",
        width: "870px",
        marginLeft: "77px",
        maxWidth: "100%",
    };

    return (
        <div
            className="d-flex flex-column align-items-start"
            style={containerStyle}
        >
            <div style={imageWrapperStyle}>
                <img
                    loading="lazy"
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/8940c89d3fc893a63a37d6ff9705f8828568c8da5a25c243aa42a21897b1dbbc?placeholderIfAbsent=true&apiKey=82af7f18abca424f9dafe2b7f0433a3e"
                    alt="Displayed content"
                    style={imageStyle}
                />
            </div>
        </div>
    );
}

export default ImageDisplay;
