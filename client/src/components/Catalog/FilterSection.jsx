import { useState, useEffect } from "react";
import axios from "axios";
import ICONS from "../../constants/icons";

const FilterSection = ({ initialCategory, setProducts, appliedFilters, setAppliedFilters, setClearFilter }) => {
  const [isCategoryVisible, setIsCategoryVisible] = useState(true);
  const [isPriceVisible, setIsPriceVisible] = useState(true);
  const [isFilterVisible, setIsFilterVisible] = useState(true);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Price range state - Cập nhật giá tối đa
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000000); // Tăng giá tối đa lên 100,000,000 đ
  const [currentMinPrice, setCurrentMinPrice] = useState(0);
  const [currentMaxPrice, setCurrentMaxPrice] = useState(100000000);
  const [priceFilterApplied, setPriceFilterApplied] = useState(false);

  // Hàm định dạng tiền tệ Việt Nam
  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/price-counts`);
        setCategories(response.data.categories);

        // Set min/max price from API without applying filters
        if (response.data.priceRange) {
          const min = response.data.priceRange.min || 0;
          // Đảm bảo giá tối đa không vượt quá 100,000,000 đ
          const max = Math.min(response.data.priceRange.max || 5000000, 100000000);
          setMinPrice(min);
          setMaxPrice(max);
          setCurrentMinPrice(min);
          setCurrentMaxPrice(max);
        }

        if (initialCategory) {
          setSelectedCategory(initialCategory);
          setAppliedFilters((prev) => ({ ...prev, category: initialCategory }));
        }
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };
    fetchFilterData();
  }, [initialCategory, setAppliedFilters]);

  useEffect(() => {
    // Only apply filters if category is selected or price filter has been explicitly applied
    if (selectedCategory || priceFilterApplied) {
      const filters = {
        category: selectedCategory || "",
        minPrice: priceFilterApplied ? currentMinPrice : undefined,
        maxPrice: priceFilterApplied ? currentMaxPrice : undefined
      };

      const fetchProductsData = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/products-filters`, {
            params: filters,
          });
          setProducts(response.data.data);
        } catch (error) {
          console.error("Error fetching products data:", error);
        }
      };

      fetchProductsData();
    }
  }, [selectedCategory, priceFilterApplied, currentMinPrice, currentMaxPrice, setProducts]);

  useEffect(() => {
    if (appliedFilters.category === "") {
      setSelectedCategory(null);
    }
    if (appliedFilters.price === "") {
      setPriceFilterApplied(false);
    }
  }, [appliedFilters]);

  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
  };

  const toggleCategoryVisibility = () => {
    setIsCategoryVisible(!isCategoryVisible);
  };

  const togglePriceVisibility = () => {
    setIsPriceVisible(!isPriceVisible);
  };

  useEffect(() => {
    const handleCategoryClick = async () => {
      if (selectedCategory) {
        // Only include price in the filter if price filter has been applied
        setAppliedFilters({
          category: selectedCategory,
          // Cập nhật định dạng giá hiển thị thành VND
          price: priceFilterApplied ? `${formatVND(currentMinPrice)}-${formatVND(currentMaxPrice)}` : ""
        });
      } else {
        setAppliedFilters({ category: "", price: "" });
        setClearFilter((prev) => !prev);
      }
    };
    handleCategoryClick();
  }, [selectedCategory, priceFilterApplied, currentMinPrice, currentMaxPrice, setAppliedFilters, setClearFilter]);

  const handlePriceApply = () => {
    setAppliedFilters((prev) => ({
      ...prev,
      // Cập nhật hiển thị giá theo định dạng VND
      price: `${formatVND(currentMinPrice)}-${formatVND(currentMaxPrice)}`
    }));
  };

  const handleMinPriceChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    const newValue = Math.min(value, currentMaxPrice - 10);
    setCurrentMinPrice(newValue);
    if (!priceFilterApplied) setPriceFilterApplied(true);
    updatePriceFilter(newValue, currentMaxPrice);
  };

  const handleMaxPriceChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    const newValue = Math.max(value, currentMinPrice + 10);
    setCurrentMaxPrice(newValue);
    if (!priceFilterApplied) setPriceFilterApplied(true);
    updatePriceFilter(currentMinPrice, newValue);
  };

  const handleSliderChange = (e) => {
    // Get slider value
    const value = parseInt(e.target.value);
    const sliderType = e.target.dataset.type;

    // Update the appropriate price value
    if (sliderType === 'min') {
      const newMin = Math.min(value, currentMaxPrice - 10);
      setCurrentMinPrice(newMin);
      if (!priceFilterApplied) setPriceFilterApplied(true);
      updatePriceFilter(newMin, currentMaxPrice);
    } else {
      const newMax = Math.max(value, currentMinPrice + 10);
      setCurrentMaxPrice(newMax);
      if (!priceFilterApplied) setPriceFilterApplied(true);
      updatePriceFilter(currentMinPrice, newMax);
    }
  };

  const updatePriceFilter = (min, max) => {
    // Only update price filter if price filtering is enabled
    if (priceFilterApplied) {
      setAppliedFilters((prev) => ({
        ...prev,
        // Cập nhật hiển thị giá theo định dạng VND
        price: `${formatVND(min)}-${formatVND(max)}`
      }));
    }
  };

  const handleClearFilters = async () => {
    setSelectedCategory(null);
    setCurrentMinPrice(minPrice);
    setCurrentMaxPrice(maxPrice);
    setPriceFilterApplied(false);
    setAppliedFilters({ category: "", price: "" });
    setClearFilter((prev) => !prev);
  };

  return (
    <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">Filters</h5>
        <button
          className="btn btn-sm text-white p-0"
          onClick={toggleFilterVisibility}
          aria-label="Toggle filters"
        >
          <i className={`fas fa-chevron-${isFilterVisible ? 'up' : 'down'}`}></i>
        </button>
      </div>

      <div className={`card-body bg-white ${isFilterVisible ? '' : 'd-none'}`}>
        <button
          className="btn btn-primary w-100 mb-4 fw-bold text-white"
          onClick={handleClearFilters}
        >
          <i className="fas fa-times-circle me-2"></i>
          Clear All Filters
        </button>

        {/* Category Section */}
        <div className="mb-4">
          <div className="accordion" id="filterAccordion">
            <div className="accordion-item border-0 p-0 bg-transparent">
              <h2 className="accordion-header" id="categoryHeading">
                <button
                  className={`accordion-button ${isCategoryVisible ? '' : 'collapsed'} p-0 bg-transparent shadow-none`}
                  type="button"
                  onClick={toggleCategoryVisibility}
                >
                  <span className="fw-bold">Categories</span>
                </button>
              </h2>
              <div
                className={`accordion-collapse collapse ${isCategoryVisible ? 'show' : ''}`}
                id="categoryCollapse"
              >
                <div className="accordion-body px-0 pt-3 pb-0">
                  <div className="category-list" style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {categories.map((category, index) => (
                      <div key={index} className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`category-${index}`}
                          checked={selectedCategory === category.name}
                          onChange={() => setSelectedCategory(
                            prev => prev === category.name ? null : category.name
                          )}
                        />
                        <label
                          className="form-check-label d-flex justify-content-between w-100"
                          htmlFor={`category-${index}`}
                        >
                          <span>{category.name}</span>
                          <span className="badge rounded-pill bg-light text-dark">{category.count}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price Range Section */}
        <hr className="my-3" />

        <div className="mb-3">
          <div className="accordion" id="priceAccordion">
            <div className="accordion-item border-0 p-0 bg-transparent">
              <h2 className="accordion-header" id="priceHeading">
                <button
                  className={`accordion-button ${isPriceVisible ? '' : 'collapsed'} p-0 bg-transparent shadow-none`}
                  type="button"
                  onClick={togglePriceVisibility}
                >
                  <span className="fw-bold">Price Range</span>
                </button>
              </h2>
              <div
                className={`accordion-collapse collapse ${isPriceVisible ? 'show' : ''}`}
                id="priceCollapse"
              >
                <div className="accordion-body px-0 pt-3 pb-0">
                  <div className="mb-3">
                    <div className="row g-2">
                      <div className="col-6">
                        <div className="input-group">
                          <span className="input-group-text fw-bold">₫</span>
                          <input
                            type="number"
                            className="form-control py-2 fs-5"
                            placeholder="Min"
                            value={currentMinPrice}
                            onChange={handleMinPriceChange}
                            style={{ height: "45px" }}
                          />
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="input-group">
                          <span className="input-group-text fw-bold">₫</span>
                          <input
                            type="number"
                            className="form-control py-2 fs-5"
                            placeholder="Max"
                            value={currentMaxPrice}
                            onChange={handleMaxPriceChange}
                            style={{ height: "45px" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fixed Range Sliders */}
                  <div className="price-range-container mb-4 px-2">
                    {/* Price range labels */}
                    <div className="d-flex justify-content-between mb-0">
                      <small className="text-muted">{formatVND(minPrice)}</small>
                      <small className="text-muted">{formatVND(maxPrice)}</small>
                    </div>

                    {/* Min price slider */}
                    <div className="mb-3">
                      <label htmlFor="minPriceRange" className="form-label mb-1">Min Price</label>
                      <input
                        type="range"
                        className="form-range"
                        id="minPriceRange"
                        min={minPrice}
                        max={maxPrice}
                        step="10"
                        value={currentMinPrice}
                        onChange={handleSliderChange}
                        data-type="min"
                      />
                    </div>

                    {/* Max price slider */}
                    <div>
                      <label htmlFor="maxPriceRange" className="form-label mb-1">Max Price</label>
                      <input
                        type="range"
                        className="form-range"
                        id="maxPriceRange"
                        min={minPrice}
                        max={maxPrice}
                        step="10"
                        value={currentMaxPrice}
                        onChange={handleSliderChange}
                        data-type="max"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-3" />

        <small className="text-muted d-block text-center mt-4">
          Use filters to refine your search results
        </small>
      </div>
    </div>
  );
};

export default FilterSection;