import PropTypes from "prop-types";

const Pagination = ({ productsPerPage, totalProducts, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalProducts / productsPerPage); i++) {
    pageNumbers.push(i);
  }

  // Show fewer page numbers on mobile
  const getVisiblePageNumbers = () => {
    if (pageNumbers.length <= 3) return pageNumbers;

    // On mobile, show just prev, current, next
    if (window.innerWidth < 576) {
      const pages = [];
      if (currentPage > 1) pages.push(currentPage - 1);
      pages.push(currentPage);
      if (currentPage < pageNumbers.length) pages.push(currentPage + 1);
      return pages;
    }

    // On larger screens, show more page numbers
    const maxLeft = Math.max(1, currentPage - 1);
    const maxRight = Math.min(pageNumbers.length, currentPage + 1);

    const visiblePages = [];

    if (maxLeft > 1) visiblePages.push(1);
    if (maxLeft > 2) visiblePages.push("...");

    for (let i = maxLeft; i <= maxRight; i++) {
      visiblePages.push(i);
    }

    if (maxRight < pageNumbers.length - 1) visiblePages.push("...");
    if (maxRight < pageNumbers.length) visiblePages.push(pageNumbers.length);

    return visiblePages;
  };

  if (pageNumbers.length <= 1) return null;

  return (
    <div
      className="d-flex justify-content-center overflow-hidden"
      style={{ position: "relative", zIndex: 1030 }}
    >
      <nav aria-label="Product pagination">
        <ul className="pagination flex-wrap mb-0">
          {/* First and Previous buttons */}
          <li
            className={`page-item d-none d-sm-block ${currentPage === 1 ? "disabled" : ""
              }`}
          >
            <button
              className="page-link"
              onClick={() => paginate(1)}
              disabled={currentPage === 1}
              aria-label="First"
            >
              <span aria-hidden="true">&laquo;&laquo;</span>
            </button>
          </li>
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous"
            >
              <span aria-hidden="true">&laquo;</span>
            </button>
          </li>

          {/* Page numbers */}
          {getVisiblePageNumbers().map((number, index) =>
            number === "..." ? (
              <li
                key={`ellipsis-${index}`}
                className="page-item disabled d-none d-sm-block"
              >
                <span className="page-link">...</span>
              </li>
            ) : (
              <li
                key={number}
                className={`page-item ${currentPage === number ? "active" : ""
                  }`}
              >
                <button onClick={() => paginate(number)} className="page-link">
                  {number}
                </button>
              </li>
            )
          )}

          {/* Next and Last buttons */}
          <li
            className={`page-item ${currentPage === pageNumbers.length ? "disabled" : ""
              }`}
          >
            <button
              className="page-link"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === pageNumbers.length}
              aria-label="Next"
            >
              <span aria-hidden="true">&raquo;</span>
            </button>
          </li>
          <li
            className={`page-item d-none d-sm-block ${currentPage === pageNumbers.length ? "disabled" : ""
              }`}
          >
            <button
              className="page-link"
              onClick={() => paginate(pageNumbers.length)}
              disabled={currentPage === pageNumbers.length}
              aria-label="Last"
            >
              <span aria-hidden="true">&raquo;&raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

Pagination.propTypes = {
  productsPerPage: PropTypes.number.isRequired,
  totalProducts: PropTypes.number.isRequired,
  paginate: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
};

export default Pagination;
