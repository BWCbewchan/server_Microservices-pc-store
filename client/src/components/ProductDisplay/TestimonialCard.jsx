import PropTypes from "prop-types";

const TestimonialCard = ({ quote, author }) => {
  return (
    <div>
      <div className="card-body">
        <blockquote className="blockquote mb-0">
          <div className="d-flex align-items-center">
            <p style={{fontSize: '140px', lineHeight: '0'}}>{`‘’`}</p>
            <p>{quote}</p>
          </div>
          <footer className="blockquote-footer text-end">{author}</footer>
        </blockquote>
      </div>
    </div>
  );
};

TestimonialCard.propTypes = {
  quote: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
};

const ActionButton = ({ text }) => {
  return <button className="btn btn-outline-primary rounded-pill">{text}</button>;
};

ActionButton.propTypes = {
  text: PropTypes.string.isRequired,
};

const TestimonialSection = () => {
  const testimonialData = {
    quote:
      "My first order arrived today in perfect condition. From the time I sent a question about the item to making the purchase, to the shipping and now the delivery, your company, Tecs, has stayed in touch. Such great service. I look forward to shopping on your site in the future and would highly recommend it.",
    author: "Tama Brown",
  };

  return (
    <section className="py-2">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10 card border-0 shadow-sm" style={{ backgroundColor: "#F5F7FF" }}>
            <TestimonialCard quote={testimonialData.quote} author={testimonialData.author} />
            <div className="d-flex justify-content-between align-items-center mt-4">
              <ActionButton text="Leave Us A Review" />
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/f027752cfb10d47c07e5cf0f846067b4c5bd19a9a39e3e225fc7c7ebe6565eff?placeholderIfAbsent=true&apiKey=1a2630dba26c44fe94fe53d5e705e42a"
                alt="Company logo"
                className="img-fluid"
                style={{ width: "78px" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
