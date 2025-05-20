import PropTypes from "prop-types";
import ProductCard from "../../components/ProductCard";
import { useRef } from "react";
import ICONS from "../../constants/icons";
import { NavLink } from "react-router-dom";

const ProductSection = ({ title, products, seeAllLink }) => {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div className="container my-3 my-md-5 position-relative px-2 px-sm-3">
      <div className="row mb-2 mb-md-3 align-items-center">
        <div className="col-7 col-md-6">
          <h2 className="section-title mb-0" style={{ fontSize: "1.25rem" }}>{title}</h2>
        </div>
        <div className="col-5 col-md-6 text-end">
          <NavLink to={`/catalog?category=${seeAllLink}`} className="text-decoration-underline see-all-link" style={{ fontSize: "0.9rem" }}>
            See All Products
          </NavLink>
        </div>
      </div>
      <div className="row">
        <div className="col position-relative px-1 px-sm-3">
          <div
            className="d-flex pb-2"
            ref={scrollRef}
            style={{
              overflow: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {products.map((product, index) => (
              <div
                className="flex-shrink-0 py-1 px-1"
                key={index}
                style={{
                  width: "calc(50% - 8px)", // 2 products per row on mobile
                  maxWidth: "calc(33.333% - 16px)", // 3 products per row on medium screens
                  "@media (min-width: 992px)": {
                    maxWidth: "320px" // Fixed width on larger screens for bigger display
                  }
                }}
              >
                <ProductCard {...product} />
              </div>
            ))}
          </div>
          <button
            className="position-absolute top-50 start-0 translate-middle-y p-0 border-0 d-none d-sm-block"
            onClick={scrollLeft}
            style={{ zIndex: 2, marginLeft: "8px", outline: "none", background: "none" }}
          >
            <img src={ICONS.Previous} alt="" className="img-fluid" style={{ maxWidth: "30px" }} />
          </button>

          <button
            className="position-absolute top-50 end-0 translate-middle-y p-0 border-0 d-none d-sm-block"
            onClick={scrollRight}
            style={{ zIndex: 2, marginRight: "8px", outline: "none", background: "none" }}
          >
            <img src={ICONS.Next} alt="" className="img-fluid" style={{ maxWidth: "30px" }} />
          </button>
        </div>
      </div>

      {/* Add media query styles for different screen sizes */}
      <style jsx="true">{`
        @media (min-width: 992px) {
          .flex-shrink-0 {
            max-width: 320px !important;
          }
          .section-title {
            font-size: 2rem !important;
            font-weight: 600;
          }
          .see-all-link {
            font-size: 1.1rem !important;
          }
        }
        
        @media (min-width: 768px) and (max-width: 991px) {
          .flex-shrink-0 {
            max-width: calc(33.333% - 16px) !important;
          }
          .section-title {
            font-size: 1.5rem !important;
          }
          .see-all-link {
            font-size: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

ProductSection.propTypes = {
  title: PropTypes.string.isRequired,
  products: PropTypes.arrayOf(
    PropTypes.shape({
      stock: PropTypes.number.isRequired,
      image: PropTypes.string.isRequired,
      rating: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      discount: PropTypes.number.isRequired,
    })
  ).isRequired,
  seeAllLink: PropTypes.string.isRequired,
};

export default ProductSection;
