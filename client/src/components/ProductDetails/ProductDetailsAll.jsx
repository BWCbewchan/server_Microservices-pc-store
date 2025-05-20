import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Features from "../../pages/Home/Features";
import FeaturesDetails from "./FeaturesDetails";
import ImageDisplay from "./ImageDisplay";
import OutplayCompetition from "./OutplayCompetition";
import ProductDetailsHead from "./ProductDetailsHead";

const ProductDetailsAll = () => {
  const [activeTab, setActiveTab] = useState("about");
  const { id } = useParams();
  const [product, setProduct] = useState({});

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/product/${id}`;
        const response = await axios.get(URL);
        setProduct(response?.data?.data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    fetchProductDetails();
  }, [id]);

  return (
    <>
      <ProductDetailsHead activeTab={activeTab} setActiveTab={setActiveTab} price={product.price} />

      {/* Breadcrumb */}
      <div className="container">
        <nav
          aria-label="breadcrumb"
          className="mb-3"
          style={{
            margin: "57px 0 60px 0",
            display: "flex",
          }}
        >
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/">Home</a>
            </li>
            <li className="breadcrumb-item">
              <a href="#laptops">Laptops</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              MSI Series
            </li>
          </ol>
        </nav>
      </div>

      {/* Product about */}
      {activeTab === "about" && (
        <div className="container my-4">
          <div className="row align-items-start">
            {/* Cột trái: Thông tin sản phẩm */}
            <div className="col-md-6">
              <h1
                className="h1"
                style={{
                  fontSize: "40px",
                  margin: "32px 0",
                }}
              >
                {product?.name}
              </h1>
              <a
                href="#review"
                className="text-decoration-none"
                style={{
                  marginBottom: "29px",
                  display: "block",
                  fontWeight: "700",
                }}
              >
                Be the first to review this product
              </a>
              <p className="mt-2 text-secondary">
                MSI MPG Trident 3 10SC-005AU Intel i7 10700F, 2060 SUPER, 16GB RAM, 512GB SSD, 2TB HDD, Windows 10 Home,
                Gaming Keyboard and Mouse, 3 Years Warranty Gaming Desktop
              </p>
              <div className="d-flex align-items-center my-3">
                <button className="btn btn-dark rounded-circle me-2" style={{ width: "15px", height: "15px" }}></button>
                <button
                  className="btn btn-light border rounded-circle me-2"
                  style={{ width: "15px", height: "15px" }}
                ></button>
                <button
                  className="btn btn-light border rounded-circle"
                  style={{ width: "15px", height: "15px" }}
                ></button>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p className="mt-3">
                  Have a Question?{" "}
                  <a href="#contact" className="text-primary">
                    Contact Us
                  </a>
                </p>
                <p className="text-muted">SKU: D1515AJ</p>
              </div>
              <a href="#more-info" className="text-dark fw-bold">
                + MORE INFORMATION
              </a>
            </div>

            {/* Cột phải: Ảnh sản phẩm */}
            <div className="col-md-6 text-center position-relative">
              {/* Ảnh sản phẩm */}
              <img src={product?.image} alt="MSI MPG Trident 3" className="img-fluid mb-3" />
            </div>
          </div>
        </div>
      )}
      {activeTab === "details" && (
        <div className="container my-4">
          <div className="alert alert-info">Product details information</div>
        </div>
      )}
      {activeTab === "specs" && (
        <div className="container my-4">
          <div className="alert alert-info">Product specifications</div>
        </div>
      )}
      <OutplayCompetition />
      <ImageDisplay />
      <FeaturesDetails />
      <Features />
    </>
  );
};

export default ProductDetailsAll;
