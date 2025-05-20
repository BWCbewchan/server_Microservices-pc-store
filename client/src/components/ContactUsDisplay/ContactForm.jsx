import FormInput from "./FormInput";

const ContactForm = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit}>
      <nav className="small mb-4">
        <span className="text-dark">Home </span>
        <span className="text-primary">›</span>
        <span className="text-dark"> Contact Us</span>
      </nav>

      <h1 className="h3 fw-semibold text-center mb-4">Contact Us</h1>

      <p className="lead mb-5">
        We love hearing from you, our Shop customers.
        <br />
        Please contact us and we will make sure to get back to you as soon as we
        possibly can.
      </p>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <FormInput label="Your Name" required placeholder="Your Name" />
        </div>
        <div className="col-md-6">
          <FormInput
            label="Your Email"
            required
            type="email"
            placeholder="Your Email"
          />
        </div>
      </div>

      <div className="mb-4">
        <FormInput label="Your Phone Number" placeholder="Your Phone" />
      </div>

      <div className="form-group mb-4">
        <label className="form-label fw-semibold">
          What&apos;s on your mind? <span className="text-danger">*</span>
        </label>
        <textarea
          className="form-control"
          rows="6"
          placeholder="Jot us a note and we'll get back to you as quickly as possible"
        />
      </div>

      <button type="submit" className="btn btn-primary px-5 py-2 rounded-pill">
        Submit
      </button>
    </form>
  );
};

export default ContactForm;
