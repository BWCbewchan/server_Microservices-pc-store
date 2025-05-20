const TestimonialCard = () => {
  return (
    <section className="container my-5">
      <div className="card bg-light border-0 p-4">
        <div className="card-body">
          <blockquote className="mb-4">
            <span className="display-4">&quot;</span>
            <p className="fs-5 ms-4">
              My first order arrived today in perfect condition. From the time I
              sent a question about the item to making the purchase, to the
              shipping and now the delivery, your company, Tecs, has stayed in
              touch. Such great service. I look forward to shopping on your site
              in the future and would highly recommend it.
            </p>
          </blockquote>
          <cite className="d-block text-end">- Tama Brown</cite>
          <div className="d-flex justify-content-between align-items-center mt-4">
            <button className="btn btn-outline-primary rounded-pill px-4">
              Leave Us A Review
            </button>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/f027752cfb10d47c07e5cf0f846067b4c5bd19a9a39e3e225fc7c7ebe6565eff?placeholderIfAbsent=true&apiKey=52b7549cc4dc41b1b490a6ca3e3b5e4d"
              alt="Rating"
              className="img-fluid"
              style={{ width: "78px" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialCard;
