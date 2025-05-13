import { useState } from "react";
import ICONS from "../../constants/icons";
import { Link } from "react-router-dom";

const SortingControls = ({ productsPerPage, setProductsPerPage, totalProducts, currentPage }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSelect = (value) => {
    setProductsPerPage(value);
    setIsDropdownOpen(false);
  };

  const startItem = (currentPage - 1) * productsPerPage + 1;
  const endItem = Math.min(currentPage * productsPerPage, totalProducts);

  return (
    <div className="row align-items-center mb-4">
      <div className="col-12 col-md-3">
        <Link
          to="/"
          className="d-flex align-items-center justify-content-center btn w-100 border-0 fw-bold hover"
          style={{ fontSize: "14px" }}
        >
          <img src={ICONS.Arrow} alt="" style={{ transform: "rotate(90deg)" }} />
          Back
        </Link>
      </div>
      <div className="col">
        <div className="d-flex align-items-center justify-content-between">
          <p className="text-muted" style={{ fontSize: "13px", color: "#A2A6B0" }}>
            Items {startItem}-{endItem} of {totalProducts}
          </p>

          <div className="d-flex gap-2 align-items-center">
            <button
              className="btn fw-bold hover"
              style={{ width: "176px", height: "50px", borderColor: "#CACDD8", borderWidth: 2, fontSize: "13px" }}
            >
              <span className="text-muted" style={{ color: "#A2A6B0" }}>
                Sort By:{" "}
              </span>
              Default
              <img src={ICONS.Arrow} alt="" />
            </button>

            <div className="dropdown">
              <button
                className="btn fw-bold hover dropdown-toggle"
                style={{ width: "176px", height: "50px", fontSize: "13px", borderColor: "#CACDD8", borderWidth: 2 }}
                onClick={toggleDropdown}
              >
                <span className="text-muted" style={{ color: "#A2A6B0" }}>
                  Show:{" "}
                </span>
                {productsPerPage} per page
                <img src={ICONS.Arrow} alt="" />
              </button>
              {isDropdownOpen && (
                <div
                  className="dropdown-menu py-0 show w-100"
                  style={{ borderRadius: 0, borderColor: "#CACDD8", borderWidth: 2, borderTop: 0 }}
                >
                  {[10, 20, 30, 40].map((value) => (
                    <button
                      key={value}
                      className="dropdown-item d-flex align-items-center justify-content-center fs-5 fw-bold py-3"
                      onClick={() => handleSelect(value)}
                    >
                      <p className="m-0">{value} per page</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="btn border-0 hover">
              <img src={ICONS.All} alt="" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortingControls;
