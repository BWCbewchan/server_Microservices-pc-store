import { useState } from "react";
import ICONS from "../../constants/icons";
import { Link } from "react-router-dom";

const SortingControls = ({ productsPerPage, setProductsPerPage, totalProducts, currentPage }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [sortOption, setSortOption] = useState("Default");

  const sortOptions = ["Default", "Price Low to High", "Price High to Low", "Name A-Z", "Name Z-A"];

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleSortDropdown = () => {
    setIsSortDropdownOpen(!isSortDropdownOpen);
  };

  const handleSelect = (value) => {
    setProductsPerPage(value);
    setIsDropdownOpen(false);
  };

  const handleSortSelect = (option) => {
    setSortOption(option);
    setIsSortDropdownOpen(false);
  };

  const startItem = (currentPage - 1) * productsPerPage + 1;
  const endItem = Math.min(currentPage * productsPerPage, totalProducts);

  return (
    <div className="card shadow-sm border-0 mb-3">
      <div className="card-body p-3">
        <div className="row align-items-center">
          {/* Back Link - Hidden on small screens */}
          <div className="col-auto d-none d-md-block">
            <Link to="/" className="btn btn-sm btn-outline-secondary d-flex align-items-center">
              <i className="fas fa-arrow-left me-1"></i>
              Back
            </Link>
          </div>

          {/* Items Counter */}
          <div className="col-12 col-sm-4 col-md-3 mb-2 mb-sm-0 text-center text-sm-start">
            <span className="text-muted small">
              Items {startItem}-{endItem} of {totalProducts}
            </span>
          </div>

          {/* Sorting Controls */}
          <div className="col-12 col-sm-8 col-md d-flex flex-wrap justify-content-center justify-content-sm-end gap-2">
            {/* Sort By Dropdown */}
            <div className="dropdown">
              <button
                className="btn btn-outline-secondary d-flex align-items-center justify-content-between"
                style={{ minWidth: "160px", fontSize: "0.9rem" }}
                onClick={toggleSortDropdown}
                aria-expanded={isSortDropdownOpen}
              >
                <span>
                  <span className="text-muted me-1">Sort By:</span>
                  {sortOption}
                </span>
                <i className="fas fa-chevron-down ms-2"></i>
              </button>

              {isSortDropdownOpen && (
                <div className="dropdown-menu shadow show" style={{ minWidth: "160px" }}>
                  {sortOptions.map((option) => (
                    <button
                      key={option}
                      className="dropdown-item"
                      onClick={() => handleSortSelect(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Items Per Page Dropdown */}
            <div className="dropdown">
              <button
                className="btn btn-outline-secondary d-flex align-items-center justify-content-between"
                style={{ minWidth: "160px", fontSize: "0.9rem" }}
                onClick={toggleDropdown}
                aria-expanded={isDropdownOpen}
              >
                <span>
                  <span className="text-muted me-1">Show:</span>
                  {productsPerPage} per page
                </span>
                <i className="fas fa-chevron-down ms-2"></i>
              </button>

              {isDropdownOpen && (
                <div className="dropdown-menu shadow show" style={{ minWidth: "160px" }}>
                  {[10, 20, 40, 60].map((value) => (
                    <button
                      key={value}
                      className="dropdown-item"
                      onClick={() => handleSelect(value)}
                    >
                      {value} per page
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid View Toggle - Hidden on small screens */}
            <button className="btn btn-outline-secondary d-none d-md-block">
              <i className="fas fa-th"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortingControls;
