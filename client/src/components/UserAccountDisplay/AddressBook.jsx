const AddressBook = () => {
    return (
      <section className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 fw-bold mb-0">Address Book</h2>
          <a href="#" className="text-primary text-decoration-underline small">
            Manage Addresses
          </a>
        </div>
  
        <hr className="mb-4" />
  
        <div className="row">
          <div className="col-md-6">
            <div className="mb-4">
              <h3 className="h6 fw-bold mb-3">Default Billing Address</h3>
              <p className="text-secondary mb-3">
                You have not set a default billing address.
              </p>
              <a
                href="#"
                className="text-primary text-decoration-underline small"
              >
                Edit Address
              </a>
            </div>
          </div>
  
          <div className="col-md-6">
            <div className="mb-4">
              <h3 className="h6 fw-bold mb-3">Default Shipping Address</h3>
              <p className="text-secondary mb-3">
                You have not set a default shipping address.
              </p>
              <a
                href="#"
                className="text-primary text-decoration-underline small"
              >
                Edit Address
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  export default AddressBook;
  