import "bootstrap/dist/css/bootstrap.min.css";

function ProductDetails() {
    return (
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
                        <li>Intel Core i7-10700F</li>
                        <li>Intel H410</li>
                        <li>White</li>
                        <li>NVIDIA MSI GeForce RTX 2060 SUPER 8GB AERO ITX GDDR6</li>
                        <li>SO-DIMM 16GB (8GB x 1) DDR4 2666MHz</li>
                        <li>2 total slots (64GB Max.)</li>
                        <li>512GB (1 x 512GB) M.2 NVMe PCIe Gen3x4 SSD</li>
                        <li>2TB (2.5") 5400RPM</li>
                        <li>Gaming Keyboard GK30 + Gaming Mouse GM11</li>
                        <li>3.5 HDD (0/0), 2.5 HDD/SSD (0/0), M.2 (1/0)</li>
                        <li>Intel WGI219V Ethernet (10/100/1000M)</li>
                        <li>AX200 (WiFi 6) + BT5.1</li>
                        <li>PSU 330W</li>
                        <li>Fan Cooler</li>
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
                        src="https://cdn.optori.com/wp-content/uploads/sites/2/2023/02/MiniPC-Optori-i9-12900H-1.png"
                        alt="MSI MPG Trident 3"
                        className="img-fluid mb-3"
                    />

                    
                </div>
            </div>
        </div>
    );
}

export default ProductDetails;
