import { useState, useEffect } from "react";
import axios from "axios";
import ICONS from "../../constants/icons";

const FilterSection = ({ initialCategory, setProducts, appliedFilters, setAppliedFilters, setClearFilter }) => {
  const [isCategoryVisible, setIsCategoryVisible] = useState(true);
  const [isPriceVisible, setIsPriceVisible] = useState(true);

  const [categories, setCategories] = useState([]);
  const [prices, setPrices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/price-counts`);
        setCategories(response.data.categories);
        setPrices(response.data.prices);
        if (initialCategory) {
          setSelectedCategory(initialCategory);
          const priceResponse = await axios.get(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/price-counts`, {
            params: { category: initialCategory },
          });
          setPrices(priceResponse.data.prices);
          setAppliedFilters((prev) => ({ ...prev, category: initialCategory }));
        }
      } catch (error) {
        console.error("Error fetching filter data:", error);
      }
    };
    fetchFilterData();
  }, [initialCategory, setAppliedFilters]);

  useEffect(() => {
    const filters = {
      category: selectedCategory,
      priceRange: selectedPrice,
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
  }, [selectedCategory, selectedPrice, setProducts]);

  useEffect(() => {
    if (appliedFilters.category === "") {
      setSelectedCategory(null);
    } else if (appliedFilters.price === "") {
      setSelectedPrice(null);
    }
  }, [appliedFilters]);

  const toggleCategoryVisibility = () => {
    setIsCategoryVisible(!isCategoryVisible);
  };

  const togglePriceVisibility = () => {
    setIsPriceVisible(!isPriceVisible);
  };

  useEffect(() => {
    const handleCategoryClick = async () => {
      setSelectedPrice(null);
      if (selectedCategory) {
        setAppliedFilters({ category: selectedCategory, price: "" });
        try {
          const response = await axios.get(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/price-counts`, {
            params: { category: selectedCategory },
          });
          setPrices(response.data.prices);
        } catch (error) {
          console.error("Error fetching price counts:", error);
        }
      } else {
        setAppliedFilters({ category: "", price: "" });
        setClearFilter((prev) => !prev);
        try {
          const response = await axios.get(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/price-counts`);
          setPrices(response.data.prices);
        } catch (error) {
          console.error("Error fetching price counts:", error);
        }
      }
    };
    handleCategoryClick();
  }, [selectedCategory, setAppliedFilters, setClearFilter]);

  const handlePriceClick = (price) => {
    setSelectedPrice(price === selectedPrice ? null : price);
    if (price !== selectedPrice) {
      setAppliedFilters((prev) => ({ ...prev, price }));
    } else {
      setAppliedFilters((prev) => ({ ...prev, price: "" }));
    }
  };

  const handleClearFilters = async () => {
    setSelectedCategory(null);
    setSelectedPrice(null);
    setAppliedFilters({ category: "", price: "" });
    setClearFilter((prev) => !prev);
  };

  const transitionStyles = {
    transition: "max-height 0.6s ease-in-out",
    overflow: "hidden",
  };

  return (
    <div className="p-3" style={{ backgroundColor: "#F9FAFB" }}>
      <div className="text-center mb-4">
        <p className="fw-bold mb-3" style={{ fontSize: "16px" }}>
          Filters
        </p>

        <button
          className="btn btn-primary w-100 fw-bold text-white hover"
          style={{
            height: "37px",
            borderColor: "#CACDD8",
            borderWidth: 2,
            fontSize: "15px",
            borderRadius: "999px",
          }}
          onClick={handleClearFilters}
        >
          Clear Filters ({(selectedCategory ? 1 : 0) + (selectedPrice ? 1 : 0)})
        </button>
      </div>

      <div className="mb-4">
        <div
          className="d-flex justify-content-between align-items-center mb-3"
          style={{ cursor: "pointer" }}
          onClick={toggleCategoryVisibility}
        >
          <p className="mb-0 fw-bold">Category</p>
          <img src={ICONS.Arrow} alt="" style={{ transform: isCategoryVisible ? "rotate(0deg)" : "rotate(90deg)" }} />
        </div>
        <div
          style={{
            ...transitionStyles,
            maxHeight: isCategoryVisible ? "500px" : "0",
          }}
        >
          {categories.map((category, index) => (
            <button
              key={index}
              className={`btn w-100 d-flex align-items-center justify-content-between hover ${selectedCategory === category.name ? "active btn-outline-primary" : ""
                }`}
              style={{ borderRadius: "6px", fontSize: "14px" }}
              onClick={() => setSelectedCategory((prev) => (prev === category.name ? null : category.name))}
            >
              {category.name} <span>{category.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div
          className="d-flex justify-content-between align-items-center mb-3"
          style={{ cursor: "pointer" }}
          onClick={togglePriceVisibility}
        >
          <p className="mb-0 fw-bold">Price</p>
          <img src={ICONS.Arrow} alt="" style={{ transform: isPriceVisible ? "rotate(0deg)" : "rotate(90deg)" }} />
        </div>
        <div
          style={{
            ...transitionStyles,
            maxHeight: isPriceVisible ? "500px" : "0",
          }}
        >
          {prices.map((price, index) => (
            <button
              key={index}
              className={`btn w-100 d-flex align-items-center justify-content-between hover hover ${selectedPrice === price.range ? "active btn-outline-primary" : ""
                }`}
              style={{ borderRadius: "6px", fontSize: "14px" }}
              onClick={() => handlePriceClick(price.range)}
            >
              {price.range} <span>{price.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="mb-0 fw-bold">Color</p>
        </div>
        <div className="rounded-circle bg-dark" style={{ width: "23px", height: "23px" }}></div>
      </div>
    </div>
  );
};

export default FilterSection;