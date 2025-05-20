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
  const searchQuery = new URLSearchParams(location.search).get("name");

  const [appliedFilters, setAppliedFilters] = useState({
    category: initialCategory || "",
    price: "",
    name: searchQuery || "",
  });
  const [products, setProducts] = useState([]);
  const [clearFilter, setClearFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(20);
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 992);
  const [isLoading, setIsLoading] = useState(false);

  // Handle window resize to adjust filter visibility
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setIsCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch products based on filters, search or category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        let URL;
        let params = {};

        if (initialCategory) {
          URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/products-category/${initialCategory}`;
        } else if (searchQuery) {
          URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/products-search`;
          params = { name: searchQuery };
        } else {
          // When no filters are applied, get all products
          URL = `${import.meta.env.VITE_APP_API_GATEWAY_URL}/products/products`;
        }

        const response = await axios.get(URL, {
          params,
          withCredentials: true,
        });

        setProducts(response?.data?.data || []);
      } catch (error) {
        console.log("Error fetching products: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [clearFilter, initialCategory, searchQuery]);

  const handleRemoveFilter = (filter) => {
    setAppliedFilters((prev) => ({
      category: filter === prev.category ? "" : prev.category,
      price: filter === prev.price ? "" : prev.price,
    }));
  };

  const FilterBadge = ({ filter }) => (
    filter ? (
      <div className="badge bg-light text-dark d-inline-flex align-items-center p-2 me-2 mb-2">
        {filter}
        <button
          className="btn-close ms-2"
          style={{ fontSize: "0.5rem" }}
          onClick={() => handleRemoveFilter(filter)}
          aria-label="Remove filter"
        ></button>
      </div>
    ) : null
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCollapseFilters = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="container-fluid px-0 py-3">
      <div className="container">
        {/* Page Header */}
        <div className="mb-4">
          <img src={IMAGES.BannerCatalog} alt="Catalog" className="img-fluid w-100 rounded mb-3" />
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <BreadcrumbNav />
              <h1 className="h2 fw-bold mt-2">
                MSI PS Series
                <span className="text-muted fs-6 ms-2">({products.length} items)</span>
              </h1>
            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              className="btn btn-outline-primary d-lg-none mt-2"
              onClick={handleCollapseFilters}
            >
              <i className="fas fa-filter me-1"></i>
              {isCollapsed ? "Show Filters" : "Hide Filters"}
            </button>
          </div>
        </div>

        {/* Sorting Controls */}
        <div className="mb-3">
          <SortingControls
            productsPerPage={productsPerPage}
            setProductsPerPage={setProductsPerPage}
            totalProducts={products.length}
            currentPage={currentPage}
          />
        </div>

        {/* Desktop Filter Toggle Button */}
        <div className="d-none d-lg-block mb-3">
          <button
            className="btn btn-outline-primary"
            onClick={handleCollapseFilters}
          >
            <i className="fas fa-filter me-2"></i>
            {isCollapsed ? "Show Filters" : "Hide Filters"}
          </button>
        </div>

        {/* Applied Filters */}
        {(appliedFilters.category || appliedFilters.price) && (
          <div className="d-flex flex-wrap mb-3">
            <div className="me-2 mb-2 align-self-center">
              <strong>Applied Filters:</strong>
            </div>
            <FilterBadge filter={appliedFilters.category} />
            <FilterBadge filter={appliedFilters.price} />
          </div>
        )}

        <div className="row g-4">
          {/* Filters Sidebar */}
          <div className={`col-lg-3 ${isCollapsed ? 'd-none' : ''}`}>
            {/* Main Filter Section */}
            <FilterSection
              initialCategory={initialCategory}
              setProducts={setProducts}
              appliedFilters={appliedFilters}
              setAppliedFilters={setAppliedFilters}
              setClearFilter={setClearFilter}
            />

            {/* Additional Sidebar Components */}
            <div className="card shadow-sm border-0 mt-4">
              <div className="card-body text-center p-3">
                <h5 className="card-title fw-bold mb-3">Brands</h5>
                <button className="btn btn-outline-secondary w-100 mb-3">All Brands</button>
                <div className="brand-logos">
                  <img
                    src="https://via.placeholder.com/250x60?text=Brand+Logos"
                    alt="Brand logos"
                    className="img-fluid"
                  />
                </div>
              </div>
            </div>

            <div className="card shadow-sm border-0 mt-4">
              <div className="card-body text-center p-3">
                <h5 className="card-title fw-bold mb-3">My Wish List</h5>
                <p className="text-muted">You have no items in your wish list.</p>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className={`col-12 ${!isCollapsed ? 'col-lg-9' : 'col-lg-12'}`}>
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-search fa-3x text-muted mb-3"></i>
                <h3>No Products Found</h3>
                <p className="text-muted">Try adjusting your search criteria.</p>
              </div>
            ) : (
              <>
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-3">
                  {currentProducts.map((product, index) => (
                    <div key={index} className="col">
                      <ProductCard {...product} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-4">
                  <Pagination
                    productsPerPage={productsPerPage}
                    totalProducts={products.length}
                    paginate={paginate}
                    currentPage={currentPage}
                  />
                </div>
              </>
            )}

            {/* Product description */}
            <article className="mt-5 p-3 bg-light rounded">
              <h4 className="fw-bold mb-3">About MSI PS Series</h4>
              <div className="text-muted">
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
              </div>
              <div className="text-center mt-4">
                <button className="btn btn-outline-primary">Read More</button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;