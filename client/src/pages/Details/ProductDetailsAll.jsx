import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import FakeSpecs from "../../components/ProductDetails/FakeSpecs";
import FeaturesDetails from "../../components/ProductDetails/FeaturesDetails";
import ImageDisplay from "../../components/ProductDetails/ImageDisplay";
import OutplayCompetition from "../../components/ProductDetails/OutplayCompetition";
import ProductDetailsHead from "../../components/ProductDetails/ProductDetailsHead";
import Features from "../Home/Features";

const ProductDetailsAll = () => {
  const [activeTab, setActiveTab] = useState("about");
  const id = useLocation().pathname.split("/")[2];
  const [product, setProduct] = useState({});
  const [selectedColor, setSelectedColor] = useState("");
  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        const URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/product/${id}`;
        const response = await axios.get(URL, { withCredentials: true });

        setProduct(response?.data?.data);
      } catch (error) {
        console.log("Error fetching new products: ", error);
      }
    };
    fetchNewProducts();
  }, [id]);
  useEffect(() => {
    if (Array.isArray(product.color) && product.color.length > 0) {
      setSelectedColor(product.color[0]);
    }
  }, [product]);
  return (
    <>
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
              <a href="/catalog?category=MSI%20Laptops">Laptops</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {product?.name}
            </li>
          </ol>
        </nav>
      </div>
      {/* Truyền activeTab và setActiveTab xuống ProductDetailsHead */}
      <ProductDetailsHead activeTab={activeTab} setActiveTab={setActiveTab} price={product.price} />

      

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
                {/* MSI MPG Trident 3 10SC-005AU Intel i7 10700F, 2060 SUPER, 16GB RAM, 512GB SSD, 2TB HDD, Windows 10 Home,
                Gaming Keyboard and Mouse, 3 Years Warranty Gaming Desktop */}
                {product?.description}
              </p>
              {/* <div className="d-flex align-items-center my-3">
                <button className="btn btn-dark rounded-circle me-2" style={{ width: "15px", height: "15px" }}></button>
                <button
                  className="btn btn-light border rounded-circle me-2"
                  style={{ width: "15px", height: "15px" }}
                ></button>
                <button
                  className="btn btn-light border rounded-circle"
                  style={{ width: "15px", height: "15px" }}
                ></button>
              </div> */}
              <div style={{ marginTop: "10px", display: 'flex' }}>
                {Array.isArray(product.color) && product.color.length > 0 ? (
                  product.color.map((color, index) => (
                    <li
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "5px",
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedColor(color)}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          backgroundColor: color,
                          border:
                            color === selectedColor ? "2px solid #000" : "1px solid #ccc",
                          marginRight: "8px",
                          borderRadius: "50%",
                          transition: "border 0.3s ease",
                        }}
                        title={color}
                      />

                    </li>
                  ))
                ) : (
                  <li>Không có màu sắc</li>
                )}
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
              {/* Chấm tròn chọn ảnh */}
              {/* <div
                   className="d-flex flex-column gap-2 position-absolute"
                   style={{ top: "50%", right: "10px", transform: "translateY(-50%)" }}
               >
                   <button
                       className="btn btn-outline-secondary rounded-circle"
                       style={{ width: "12px", height: "12px" }}
                   ></button>
                   <button
                       className="btn btn-primary rounded-circle"
                       style={{ width: "12px", height: "12px" }}
                   ></button>
                   <button
                       className="btn btn-outline-secondary rounded-circle"
                       style={{ width: "12px", height: "12px" }}
                   ></button>
               </div> */}

              {/* Ảnh sản phẩm */}
              <img
                src={product?.image}
                alt="MSI MPG Trident 3"
                className="img-fluid mb-3"
              />
            </div>
          </div>
        </div>
      )}
      {activeTab === "details" && (
        <div className="container my-4">
          {/* Breadcrumb */}
          {/* <nav aria-label="breadcrumb" className="mb-3" style={{
                margin: '57px 0 60px 0',
                display: 'flex'

            }}>
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
            </nav> */}

          <div className="row">
            {/* Cột trái: Thông tin chi tiết */}
            <div className="col-md-6">
              <h1 className="h1" style={{
                fontSize: '40px',
                margin: '32px 0'
              }}>MSI MPG Trident 3</h1>
              <a href="#review" className="text-decoration-none" style={{
                marginBottom: '29px',
                display: 'block',
                fontWeight: '700',
              }}>
                Be the first to review this product
              </a>

              {/* Danh sách chi tiết sản phẩm */}
              <ul className="mt-3 list-unstyled">
                {Array.isArray(product.details) && product.details.length > 0
                  ? product.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))
                  : <li>Không có chi tiết</li>}
              </ul>

              <div style={{ display: "flex", justifyContent: "space-between" }}>

                <p className="mt-3">
                  Have a Question? <a href="#contact" className="text-primary">Contact Us</a>
                </p>
                <p className="text-muted">SKU: D1515AJ</p>
              </div>
              <a href="#more-info" className="text-dark fw-bold">
                + MORE INFORMATION
              </a>


            </div>

            {/* Cột phải: Ảnh sản phẩm, chấm tròn, thông tin thanh toán */}
            <div className="col-md-6 text-center position-relative">
              {/* Chấm tròn chọn ảnh */}
              {/* <div
                        className="d-flex flex-column gap-2 position-absolute"
                        style={{ top: "50%", right: "10px", transform: "translateY(-50%)" }}
                    >
                        <button
                            className="btn btn-outline-secondary rounded-circle"
                            style={{ width: "12px", height: "12px" }}
                        ></button>
                        <button
                            className="btn btn-primary rounded-circle"
                            style={{ width: "12px", height: "12px" }}
                        ></button>
                        <button
                            className="btn btn-outline-secondary rounded-circle"
                            style={{ width: "12px", height: "12px" }}
                        ></button>
                    </div> */}

              {/* Ảnh sản phẩm */}
              <img
                src={product?.image}
                alt="MSI MPG Trident 3"
                className="img-fluid mb-3"
              />


            </div>
          </div>
        </div>
      )}
      {activeTab === "specs" && (
        <div className="container my-4">
          {/* Breadcrumb */}
          {/* <nav aria-label="breadcrumb" className="mb-3" style={{
                margin: '57px 0 60px 0',
                display: 'flex'

            }}>
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
            </nav> */}

          <div className="row">
            {/* Cột trái: Thông tin Specs */}
            <div className="col-md-6">
              <h1 className="h1" style={{
                fontSize: '40px',
                margin: '32px 0'
              }}>{product?.name}</h1>
              <a href="#review" className="text-decoration-none" style={{
                marginBottom: '29px',
                display: 'block',
                fontWeight: '700',
              }}>
                Be the first to review this product
              </a>

              {/* Bảng thông số kỹ thuật
              <table className="table mt-3 border" style={{ maxWidth: "400px" }}>
                <tbody>
                  <tr>
                    <th className="p-2 text-start" style={{ backgroundColor: "#f1f1f1", width: "150px" }}>CPU</th>
                    <td className="p-2">N/A</td>
                  </tr>
                  <tr>
                    <th className="p-2 text-start" style={{ backgroundColor: "#f1f1f1" }}>Featured</th>
                    <td className="p-2">N/A</td>
                  </tr>
                  <tr>
                    <th className="p-2 text-start" style={{ backgroundColor: "#f1f1f1" }}>I/O Ports</th>
                    <td className="p-2">N/A</td>
                  </tr>
                </tbody>
              </table> */}
              <FakeSpecs />

              <div style={{ display: "flex", justifyContent: "space-between" }}>

                <p className="mt-3">
                  Have a Question? <a href="#contact" className="text-primary">Contact Us</a>
                </p>
                <p className="text-muted">SKU: D1515AJ</p>
              </div>
              <a href="#more-info" className="text-dark fw-bold">
                + MORE INFORMATION
              </a>
            </div>

            {/* Cột phải: Ảnh sản phẩm, chấm tròn, thông tin thanh toán */}
            <div className="col-md-6 text-center position-relative">
              {/* Chấm tròn chọn ảnh */}
              {/* <div
                        className="d-flex flex-column gap-2 position-absolute"
                        style={{ top: "50%", right: "10px", transform: "translateY(-50%)" }}
                    >
                        <button
                            className="btn btn-outline-secondary rounded-circle"
                            style={{ width: "12px", height: "12px" }}
                        ></button>
                        <button
                            className="btn btn-primary rounded-circle"
                            style={{ width: "12px", height: "12px" }}
                        ></button>
                        <button
                            className="btn btn-outline-secondary rounded-circle"
                            style={{ width: "12px", height: "12px" }}
                        ></button>
                    </div> */}

              {/* Ảnh sản phẩm */}
              <img
                src={product?.image}
                alt="MSI MPG Trident 3"
                className="img-fluid mb-3"
              />

              {/* Thông tin thanh toán (Zip, v.v.) */}

            </div>
          </div>
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
