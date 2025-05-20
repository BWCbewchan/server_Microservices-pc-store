import FeatureCard from "./FeatureCard";
import "bootstrap/dist/css/bootstrap.min.css";

const featuresData = [
  {
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/bc7af2311c2a6534f6a6d6bbe8a3bf535ea5e4082afeb525ff963d9cc4eec083?placeholderIfAbsent=true&apiKey=82af7f18abca424f9dafe2b7f0433a3e",
    title: "Intel® Core™ i7",
    description: "Processor with the upmost computing power to bring you an unparalleled gaming experience.",
  },
  {
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/7f98a4a14ecc2a9ab006173308ce04e85bd1ead2bf3b73a6286d14f8b32e47f3?placeholderIfAbsent=true&apiKey=82af7f18abca424f9dafe2b7f0433a3e",
    title: "GeForce® RTX SUPER™",
    description: "Series has more cores and higher clocks for superfast performance compared to previous-gen GPUs.",
  },
  {
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/3953d6f82fe64b38e6dd64ef75324500fc48684fa7bc2c078821ebe3cdaeb8c5?placeholderIfAbsent=true&apiKey=82af7f18abca424f9dafe2b7f0433a3e",
    title: "SSD technology",
    description: "Unleash the full potential with the latest NVM Express. 6 times faster than traditional SATA SSD.",
  },
  {
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/574bd89aed185c56a54a25457625808ab2038140d6c68d1de9093315a6913c51?placeholderIfAbsent=true&apiKey=82af7f18abca424f9dafe2b7f0433a3e",
    title: "10th Gen Intel® Core™",
    description: "Processors, memory can support up to DDR4 2933MHz to deliver an unprecedented gaming experience.",
  },
];

// Style cho toàn block
const sectionStyle = {
  backgroundColor: "#000", // Nền đen
  color: "#fff", // Chữ trắng
  padding: "84px 80px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

// Style cho phần wrapper chứa nội dung
const wrapperStyle = {
  width: "1144px",
  maxWidth: "100%",
  textAlign: "center",
};

// Style cho tiêu đề "Features"
const titleStyle = {
  color: "#ffffff",
  font: "500 38px Poppins, sans-serif",
  marginBottom: "20px",
};

// Style cho đoạn mô tả ngắn bên dưới tiêu đề
const descriptionStyle = {
  color: "#ffffff",
  font: "300 18px/26px Poppins, sans-serif",
  maxWidth: "600px",
  margin: "0 auto",
  marginBottom: "40px",
};

// Style cho khối chứa 4 FeatureCard
const cardsContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "40px",
  justifyContent: "center",
};

const FeaturesDetails = () => {
  return (
    <div style={sectionStyle}>
      <div style={wrapperStyle}>
        <h2 style={titleStyle}>Features</h2>
        <p style={descriptionStyle}>
          The MPG series brings out the best in gamers by allowing full expression in color with advanced RGB lighting
          control and synchronization.
        </p>
        <div style={cardsContainerStyle}>
          {featuresData.map((feature, index) => (
            <FeatureCard key={index} image={feature.image} title={feature.title} description={feature.description} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesDetails;
