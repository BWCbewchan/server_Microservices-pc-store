import React from "react";

const FeatureCard = ({ image, title, description }) => {
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    color: "#ffffff",
    font: "300 14px/22px Poppins, sans-serif",
    margin: "0 auto",
    maxWidth: "250px", // Giới hạn bề rộng mỗi card
  };

  const imageStyle = {
    width: "64px",
    height: "64px",
    objectFit: "contain",
    objectPosition: "center",
    marginBottom: "16px",
  };

  const titleStyle = {
    fontWeight: "700",
    fontSize: "16px",
    marginBottom: "8px",
  };

  const descriptionStyle = {
    fontSize: "14px",
    lineHeight: "22px",
  };

  return (
    <div style={containerStyle}>
      <img src={image} alt={`${title} feature`} style={imageStyle} />
      <h5 style={titleStyle}>{title}</h5>
      <p style={descriptionStyle}>{description}</p>
    </div>
  );
};

export default FeatureCard;
