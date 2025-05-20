import { useState, useEffect } from "react";
import ICONS from "../../constants/icons";
import { Link } from "react-router-dom";

const SortingControls = ({
  productsPerPage,
  setProductsPerPage,
  totalProducts,
  currentPage,
  sortOption,
  setSortOption
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen || isSortDropdownOpen) {
        if (!event.target.closest('.dropdown-container')) {
          setIsDropdownOpen(false);
          setIsSortDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isSortDropdownOpen]);

  const sortOptions = [
    { label: "Default", value: "default" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
    { label: "Name: A to Z", value: "name_asc" },
    { label: "Name: Z to A", value: "name_desc" },
    { label: "Rating: High to Low", value: "rating_desc" }
  ];

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (isSortDropdownOpen) setIsSortDropdownOpen(false);
  };

  const toggleSortDropdown = () => {
    setIsSortDropdownOpen(!isSortDropdownOpen);
    if (isDropdownOpen) setIsDropdownOpen(false);
  };

  const handleSelect = (value) => {
    setProductsPerPage(value);
    setIsDropdownOpen(false);
  };

  const handleSortSelect = (value) => {
    setSortOption(value);
    setIsSortDropdownOpen(false);
  };

  const startItem = (currentPage - 1) * productsPerPage + 1;
  const endItem = Math.min(currentPage * productsPerPage, totalProducts);

  // Find current sort option label
  const currentSortLabel = sortOptions.find(option => option.value === sortOption)?.label || "Default";

  return (
    <div className="card shadow-sm border-0 mb-3" style={{ position: "relative", zIndex: 1040 }}>
      <div className="card-body p-2 p-sm-3">
        <div className="row g-2 align-items-center">
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
              {totalProducts > 0 ? `Items ${startItem}-${endItem} of ${totalProducts}` : 'No items found'}
            </span>
          </div>

          {/* Sorting Controls */}
          <div className="col-12 col-sm-8 col-md d-flex flex-wrap justify-content-center justify-content-sm-end gap-2">
            {/* Sort By Dropdown - Enhanced positioning */}
            <div className="dropdown-container position-relative" style={{ zIndex: 1050 }}>
              <button
                className="btn btn-outline-secondary d-flex align-items-center justify-content-between"
                style={{
                  width: "100%",
                  maxWidth: "180px",
                  fontSize: "0.9rem",
                  position: "relative"
                }}
                onClick={toggleSortDropdown}
                aria-expanded={isSortDropdownOpen}
              >
                <span className="text-truncate">
                  <span className="text-muted me-1">Sort:</span>
                  {currentSortLabel}
                </span>
                <i className={`fas fa-chevron-${isSortDropdownOpen ? 'up' : 'down'} ms-2`}></i>
              </button>

              {isSortDropdownOpen && (
                <>
                  {/* Semi-transparent overlay for dropdown */}
                  <div
                    className="position-fixed top-0 start-0 w-100 h-100"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.1)",
                      zIndex: 1049,
                      left: 0,
                      top: 0
                    }}
                    onClick={() => setIsSortDropdownOpen(false)}
                  ></div>

                  <div
                    className="dropdown-menu shadow show w-100"
                    style={{
                      maxWidth: "180px",
                      position: "absolute",
                      zIndex: 1050,
                      marginTop: "2px"
                    }}
                  >
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`dropdown-item text-truncate ${sortOption === option.value ? 'active' : ''}`}
                        onClick={() => handleSortSelect(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Items Per Page Dropdown */}
            <div className="dropdown-container position-relative" style={{ zIndex: 1050 }}>
              <button
                className="btn btn-outline-secondary d-flex align-items-center justify-content-between"
                style={{
                  width: "100%",
                  maxWidth: "160px",
                  fontSize: "0.9rem",
                  position: "relative"
                }}
                onClick={toggleDropdown}
                aria-expanded={isDropdownOpen}
              >
                <span className="text-truncate">
                  <span className="text-muted me-1 d-none d-sm-inline">Show:</span>
                  {productsPerPage} per page
                </span>
                <i className={`fas fa-chevron-${isDropdownOpen ? 'up' : 'down'} ms-2`}></i>
              </button>

              {isDropdownOpen && (
                <>
                  {/* Semi-transparent overlay for dropdown */}
                  <div
                    className="position-fixed top-0 start-0 w-100 h-100"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.1)",
                      zIndex: 1049,
                      left: 0,
                      top: 0
                    }}
                    onClick={() => setIsDropdownOpen(false)}
                  ></div>

                  <div
                    className="dropdown-menu shadow show w-100"
                    style={{
                      maxWidth: "160px",
                      position: "absolute",
                      zIndex: 1050,
                      marginTop: "2px"
                    }}
                  >
                    {[10, 20, 40, 60].map((value) => (
                      <button
                        key={value}
                        className={`dropdown-item ${productsPerPage === value ? 'active' : ''}`}
                        onClick={() => handleSelect(value)}
                      >
                        {value} per page
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortingControls;
