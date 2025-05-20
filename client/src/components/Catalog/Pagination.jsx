import PropTypes from "prop-types";

const Pagination = ({ productsPerPage, totalProducts, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalProducts / productsPerPage); i++) {
    pageNumbers.push(i);
  }

  // Show max 5 page numbers with current page in the middle
  const getVisiblePageNumbers = () => {
    if (pageNumbers.length <= 5) return pageNumbers;

    const maxLeft = Math.max(1, currentPage - 2);
    const maxRight = Math.min(pageNumbers.length, currentPage + 2);

    const visiblePages = [];

    if (maxLeft > 1) visiblePages.push(1, "…");

    for (let i = maxLeft; i <= maxRight; i++) {
      visiblePages.push(i);
    }

    if (maxRight < pageNumbers.length) {
      visiblePages.push("…", pageNumbers.length);
    }

    return visiblePages;
  };

  if (pageNumbers.length <= 1) return null;

  return (
    <nav aria-label="Product pagination">
      <ul className="pagination justify-content-center flex-wrap">
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

        {getVisiblePageNumbers().map((number, index) =>
          number === "…" ? (
            <li key={`ellipsis-${index}`} className="page-item disabled">
              <span className="page-link">…</span>
            </li>
          ) : (
            <li
              key={number}
              className={`page-item ${currentPage === number ? "active" : ""}`}
            >
              <button onClick={() => paginate(number)} className="page-link">
                {number}
              </button>
            </li>
          )
        )}

        <li className={`page-item ${currentPage === pageNumbers.length ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === pageNumbers.length}
            aria-label="Next"
          >
            <span aria-hidden="true">&raquo;</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

Pagination.propTypes = {
  productsPerPage: PropTypes.number.isRequired,
  totalProducts: PropTypes.number.isRequired,
  paginate: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
};

export default Pagination;
