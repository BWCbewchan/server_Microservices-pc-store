const Pagination = ({ productsPerPage, totalProducts, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalProducts / productsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav aria-label="Page navigation" className="my-4">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button className="page-link" aria-label="Previous" onClick={() => paginate(currentPage - 1)}>
            <span aria-hidden="true">‹</span>
          </button>
        </li>
        {pageNumbers.map((number) => (
          <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
            <button onClick={() => paginate(number)} className="page-link">
              {number}
            </button>
          </li>
        ))}
        <li className={`page-item ${currentPage === pageNumbers.length ? "disabled" : ""}`}>
          <button className="page-link" aria-label="Next" onClick={() => paginate(currentPage + 1)}>
            <span aria-hidden="true">›</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
