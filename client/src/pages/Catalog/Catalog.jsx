import { useEffect, useState } from "react";
import ProductCard from "../../components/ProductCard";
import FilterSection from "../../components/Catalog/FilterSection";
import BreadcrumbNav from "../../components/Catalog/BreadcrumbNav";
import Pagination from "../../components/Catalog/Pagination";
import SortingControls from "../../components/Catalog/SortingControls";
import axios from "axios";
import IMAGES from "../../constants/images";
import { useLocation } from "react-router-dom";
import ICONS from "../../constants/icons";

const Catalog = () => {
  const location = useLocation();
  const initialCategory = new URLSearchParams(location.search).get("category");

  const [appliedFilters, setAppliedFilters] = useState({
    category: initialCategory || "",
    price: "",
  });
  const [products, setProducts] = useState([]);
  const [clearFilter, setClearFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(20);
  const [isLoading, setIsLoading] = useState(true);

  // Sử dụng isFilterVisible để phản ánh trạng thái hiển thị của bộ lọc
  const [isFilterVisible, setIsFilterVisible] = useState(window.innerWidth >= 992);

  // Theo dõi kích thước màn hình để tự động hiển thị bộ lọc trên màn hình lớn
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        // Trên màn hình lớn, luôn hiển thị bộ lọc
        setIsFilterVisible(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        let URL;

        if (initialCategory) {
          // Nếu có category, tải sản phẩm theo category
          URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/products-category/${initialCategory}`;
        } else {
          // Nếu không có category, tải tất cả sản phẩm
          URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/products`;
        }

        console.log("Fetching products from URL:", URL);
        const response = await axios.get(URL, { withCredentials: true });

        console.log("API response:", response.data);

        if (response?.data?.data) {
          setProducts(response.data.data);
          console.log(`Loaded ${response.data.data.length} products`);
        } else {
          console.error("Unexpected API response structure:", response.data);
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        // Thêm thông tin chi tiết về lỗi
        if (error.response) {
          console.error("Response error data:", error.response.data);
          console.error("Response error status:", error.response.status);
        }
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [clearFilter, initialCategory]);

  const handleRemoveFilter = (filter) => {
    const newFilters = {
      category: filter === appliedFilters.category ? "" : appliedFilters.category,
      price: filter === appliedFilters.price ? "" : appliedFilters.price
    };

    setAppliedFilters(newFilters);

    // Nếu không còn bất kỳ bộ lọc nào, tải lại tất cả sản phẩm
    if (!newFilters.category && !newFilters.price) {
      setClearFilter(prev => !prev); // Trigger lại effect để tải tất cả sản phẩm
    }
  };

  const FilterBadge = ({ filter }) => (
    <>
      {filter && (
        <div
          className="d-inline-flex align-items-center me-2 mb-2 rounded-pill px-3 py-1"
          style={{
            fontSize: "13px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #CACDD8"
          }}
        >
          <span className="me-2">{filter}</span>
          <span className="text-muted me-2" style={{ color: "#A2A6B0" }}>
            (24)
          </span>
          <button
            className="btn-close btn-close-sm"
            onClick={() => handleRemoveFilter(filter)}
            style={{ fontSize: "0.65rem" }}
            aria-label="Remove filter"
          ></button>
        </div>
      )}
    </>
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleFilters = () => {
    setIsFilterVisible(prev => !prev);
  };

  return (
    <div className="container-fluid py-5 pt-0">
      <div className="container" style={{ overflow: "hidden" }}>
        <div className="mb-5">
          <img src={IMAGES.BannerCatalog} alt="Header banner" className="img-fluid mb-4" />
          <BreadcrumbNav />
          <h1 className="h3 display-3">MSI PS Series (20)</h1>
        </div>

        {/* Filter toggle button & sorting controls - responsive row */}
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
          {/* Filter button cho tất cả kích thước màn hình */}
          <button
            className="btn btn-outline-secondary d-flex align-items-center"
            onClick={toggleFilters}
            aria-expanded={isFilterVisible}
          >
            <img src={ICONS.Filter} alt="Filter" className="me-2" />
            <span>{isFilterVisible ? "Ẩn bộ lọc" : "Hiện bộ lọc"}</span>
          </button>

          {/* Sorting controls */}
          <SortingControls
            productsPerPage={productsPerPage}
            setProductsPerPage={setProductsPerPage}
            totalProducts={products.length}
            currentPage={currentPage}
          />
        </div>

        {/* Applied Filters - horizontal scrollable on mobile */}
        {(appliedFilters.category || appliedFilters.price) && (
          <div className="mb-3 pb-2 overflow-auto" style={{ whiteSpace: "nowrap" }}>
            <FilterBadge filter={appliedFilters.category} />
            <FilterBadge filter={appliedFilters.price} />

            <button
              className="btn btn-sm btn-outline-danger ms-2"
              onClick={() => {
                setAppliedFilters({ category: "", price: "" });
                setClearFilter(prev => !prev);
              }}
            >
              Xóa tất cả
            </button>
          </div>
        )}

        <div className="row g-4">
          {/* Sidebar Filters - animated collapse */}
          <div
            className={`col-lg-3 mb-4 ${isFilterVisible ? 'd-block' : 'd-none'}`}
            style={{
              transition: "all 0.3s ease-in-out"
            }}
          >
            <div className="card shadow-sm">
              <div className="card-body p-3">
                <FilterSection
                  initialCategory={initialCategory}
                  setProducts={setProducts}
                  appliedFilters={appliedFilters}
                  setAppliedFilters={setAppliedFilters}
                  setClearFilter={setClearFilter}
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={`${isFilterVisible ? 'col-lg-9' : 'col-12'}`}>
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Đang tải sản phẩm...</p>
              </div>
            ) : currentProducts.length > 0 ? (
              <div className={`row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-${isFilterVisible ? '4' : '5'} g-4`}>
                {currentProducts.map((product, index) => (
                  <div key={index} className="col">
                    <ProductCard {...product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5">
                <div className="mb-3">
                  <i className="fa fa-search fa-3x text-muted"></i>
                </div>
                <h5>Không tìm thấy sản phẩm</h5>
                <p className="text-muted">Hãy thử điều chỉnh bộ lọc hoặc tiêu chí tìm kiếm của bạn.</p>
                <button
                  className="btn btn-primary mt-3"
                  onClick={() => {
                    setAppliedFilters({ category: "", price: "" });
                    setClearFilter(prev => !prev);
                  }}
                >
                  Xóa bộ lọc và thử lại
                </button>
              </div>
            )}

            {currentProducts.length > 0 && (
              <Pagination
                productsPerPage={productsPerPage}
                totalProducts={products.length}
                paginate={paginate}
                currentPage={currentPage}
                className="mt-4"
              />
            )}

            <article className="mt-5 small text-muted">
              <p className="mb-3">
                MSI has unveiled the Prestige Series line of business-class and gaming notebooks. Tuned for color
                accuracy, the Prestige Series also leverages True Color Technology, which allows users to adjust the
                display profile to best fit their computing needs.
              </p>
              <p className="mb-3">
                There are six different screen profiles, which are tuned for gaming, reducing eye fatigue, sRGB color
                accuracy, increasing clarity for words and lines, reducing harmful blue light, and optimizing contrast
                for watching movies.
              </p>
              <p className="mb-3">
                Given the various display profiles and discrete graphics chip, the Prestige Series notebooks can be used
                for various design work as well as for office tasks given that the screen can be adjusted for better
                clarity, color accuracy, or for eye strain reduction. Users working with video or 3D rendering will
              </p>
              <p className="mb-3">
                strain. This is helpful when working on the computer for extended periods of time. Additionally, in
                their down time, brightness.
              </p>
            </article>

            <div className="text-center mt-4">
              <button className="btn btn-outline-secondary">Xem thêm</button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Offcanvas - shows on small screens when filter button clicked */}
      <div
        className="offcanvas offcanvas-start d-lg-none"
        tabIndex="-1"
        id="filterOffcanvas"
        style={{ visibility: isFilterVisible ? 'visible' : 'hidden', width: '80%' }}
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Filters</h5>
          <button
            type="button"
            className="btn-close"
            onClick={toggleFilters}
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <FilterSection
            initialCategory={initialCategory}
            setProducts={setProducts}
            appliedFilters={appliedFilters}
            setAppliedFilters={setAppliedFilters}
            setClearFilter={setClearFilter}
          />
        </div>
      </div>
    </div>
  );
};

export default Catalog;
