import PropTypes from "prop-types";

const BrandSection = ({ brands }) => {
  return (
    <div className="container my-5">
      <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-6 g-4 justify-content-center">
        {brands.map((brand, index) => (
          <div key={index} className="col d-flex justify-content-center align-items-center px-4">
            <img src={brand.image} alt={brand.name} className="img-fluid" />
          </div>
        ))}
      </div>
    </div>
  );
};

BrandSection.propTypes = {
  brands: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default BrandSection;
