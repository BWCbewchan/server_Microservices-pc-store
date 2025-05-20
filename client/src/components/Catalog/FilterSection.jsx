import { useState, useEffect } from "react";
import { Accordion, Form } from "react-bootstrap";
import axios from "axios";

const FilterSection = ({ initialCategory, setProducts, appliedFilters, setAppliedFilters, setClearFilter }) => {
  const [categories, setCategories] = useState([
    "Laptops",
    "Desktop PCs",
    "Monitors",
    "Peripherals",
    "Networking",
    "Components",
    "Accessories",
  ]);

  // Định nghĩa giá trị tối thiểu và tối đa cho price range
  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: 5000,
    currentMin: 0,
    currentMax: 5000
  });

  // Fetch categories from API (if available)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Implement your category fetching logic here
        // const response = await axios.get("your-categories-endpoint");
        // setCategories(response.data);
      } catch (error) {
        console.log("Error fetching categories:", error);
      }
    };

    // fetchCategories();
  }, []);

  // Hàm gọi API lọc sản phẩm theo giá
  const fetchProductsByPrice = async (min, max) => {
    try {
      console.log(`Lọc sản phẩm theo khoảng giá: $${min} - $${max}`);

      // Xây dựng URL cơ bản cho việc lọc theo giá
      let baseURL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/products`;
      let endpoint = '';
      let params = {};

      // Nếu có cả category và price range
      if (appliedFilters.category) {
        console.log(`Áp dụng danh mục: ${appliedFilters.category}`);
        // Ưu tiên sử dụng endpoint products-filters với cả category và price range
        endpoint = '/products-filters';
        params = {
          category: appliedFilters.category,
          priceRange: `${min}-${max}`
        };
      } else {
        // Nếu chỉ có price range, vẫn sử dụng products-filters nhưng chỉ với price
        endpoint = '/products-filters';
        params = {
          priceRange: `${min}-${max}`
        };
      }

      // Xây dựng query string từ params
      const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');

      // URL đầy đủ
      const fullURL = `${baseURL}${endpoint}?${queryString}`;
      console.log("API request URL:", fullURL);

      // Gọi API với URL đã xây dựng
      const response = await axios.get(fullURL, { withCredentials: true });

      console.log("API response:", response.data);
      if (response?.data?.data) {
        setProducts(response.data.data);
        console.log(`Loaded ${response.data.data.length} products after filtering`);
      } else {
        console.error("Unexpected API response:", response.data);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products by price:", error);
      // Hiển thị lỗi chi tiết hơn để dễ debug
      if (error.response) {
        console.error("Response error data:", error.response.data);
        console.error("Response error status:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      }
      // Có thể giữ nguyên sản phẩm hiện tại trong trường hợp lỗi
      // hoặc set về mảng rỗng tùy theo yêu cầu
    }
  };

  const handleCategoryChange = async (category) => {
    console.log(`Chọn danh mục: ${category}`);

    setAppliedFilters(prev => ({
      ...prev,
      category,
    }));

    try {
      // Update to use route params or query params based on your API design
      const URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/products-category/${category}`;
      console.log("API request URL:", URL);

      const response = await axios.get(URL, { withCredentials: true });

      console.log("API response:", response.data);
      if (response?.data?.data) {
        setProducts(response.data.data);
        console.log(`Loaded ${response.data.data.length} products for category ${category}`);
      } else {
        console.error("Unexpected API response:", response.data);
        setProducts([]);
      }
    } catch (error) {
      console.error(`Error fetching products for category ${category}:`, error);
      if (error.response) {
        console.error("Response error data:", error.response.data);
        console.error("Response error status:", error.response.status);
      }
    }
  };

  // Xử lý khi slider price thay đổi
  const handlePriceSliderChange = (e) => {
    const { name, value } = e.target;
    setPriceRange(prev => ({
      ...prev,
      [name === "minPrice" ? "currentMin" : "currentMax"]: parseInt(value)
    }));
  };

  // Xử lý khi input price thay đổi
  const handlePriceInputChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;

    setPriceRange(prev => ({
      ...prev,
      [name === "minPrice" ? "currentMin" : "currentMax"]: numValue
    }));
  };

  // Xử lý khi áp dụng price range
  const applyPriceRange = () => {
    // Đảm bảo min không lớn hơn max
    const validMin = Math.min(priceRange.currentMin, priceRange.currentMax);
    const validMax = Math.max(priceRange.currentMin, priceRange.currentMax);

    const priceRangeString = `$${validMin} - $${validMax}`;
    setAppliedFilters(prev => ({
      ...prev,
      price: priceRangeString
    }));

    // Gọi API để lọc sản phẩm theo giá
    fetchProductsByPrice(validMin, validMax);
  };

  const handleClearFilters = () => {
    setAppliedFilters({ category: "", price: "" });
    setPriceRange({
      min: 0,
      max: 5000,
      currentMin: 0,
      currentMax: 5000
    });
    setClearFilter((prev) => !prev);
  };

  // Parse giá trị giá từ applied filter (nếu có)
  useEffect(() => {
    if (appliedFilters.price) {
      const priceMatch = appliedFilters.price.match(/\$(\d+) - \$(\d+)/);
      if (priceMatch) {
        setPriceRange(prev => ({
          ...prev,
          currentMin: parseInt(priceMatch[1]),
          currentMax: parseInt(priceMatch[2])
        }));
      }
    }
  }, [appliedFilters.price]);

  // Thêm useEffect để debug khi appliedFilters thay đổi
  useEffect(() => {
    console.log("Applied filters changed:", appliedFilters);
  }, [appliedFilters]);

  return (
    <div className="filter-section">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0 fw-bold">Lọc sản phẩm</h5>
        {(appliedFilters.category || appliedFilters.price) && (
          <button
            className="btn btn-sm text-danger p-0"
            onClick={handleClearFilters}
            style={{ fontSize: "0.85rem" }}
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Phần Categories */}
      <div className="mb-4">
        <h6 className="mb-3 fw-bold">Danh mục</h6>
        <div className="d-flex flex-column gap-2">
          {categories.map((category, index) => (
            <div className="form-check" key={index}>
              <input
                className="form-check-input"
                type="radio"
                name="category"
                id={`category-${index}`}
                checked={appliedFilters.category === category}
                onChange={() => handleCategoryChange(category)}
              />
              <label
                className="form-check-label d-flex justify-content-between"
                htmlFor={`category-${index}`}
                style={{ fontSize: "0.95rem" }}
              >
                <span>{category}</span>
                <span className="text-muted">({Math.floor(Math.random() * 50) + 5})</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Phần Price Range với slider */}
      <div className="mb-4">
        <h6 className="mb-3 fw-bold">Khoảng giá</h6>

        <div className="price-inputs d-flex mb-3">
          <div className="input-group input-group-sm me-2">
            <span className="input-group-text">$</span>
            <input
              type="number"
              className="form-control"
              name="minPrice"
              value={priceRange.currentMin}
              onChange={handlePriceInputChange}
              min={priceRange.min}
              max={priceRange.max}
            />
          </div>
          <div className="input-group input-group-sm">
            <span className="input-group-text">$</span>
            <input
              type="number"
              className="form-control"
              name="maxPrice"
              value={priceRange.currentMax}
              onChange={handlePriceInputChange}
              min={priceRange.min}
              max={priceRange.max}
            />
          </div>
        </div>

        {/* Slider for min price */}
        <Form.Label className="d-flex justify-content-between mb-1">
          <small>Giá tối thiểu</small>
          <small className="text-primary">${priceRange.currentMin}</small>
        </Form.Label>
        <Form.Range
          name="minPrice"
          min={priceRange.min}
          max={priceRange.max}
          value={priceRange.currentMin}
          onChange={handlePriceSliderChange}
          className="mb-3"
        />

        {/* Slider for max price */}
        <Form.Label className="d-flex justify-content-between mb-1">
          <small>Giá tối đa</small>
          <small className="text-primary">${priceRange.currentMax}</small>
        </Form.Label>
        <Form.Range
          name="maxPrice"
          min={priceRange.min}
          max={priceRange.max}
          value={priceRange.currentMax}
          onChange={handlePriceSliderChange}
          className="mb-3"
        />

        <button
          className="btn btn-sm btn-primary w-100"
          onClick={applyPriceRange}
        >
          Áp dụng khoảng giá
        </button>
      </div>
    </div>
  );
};

export default FilterSection;
