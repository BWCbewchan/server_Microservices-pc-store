import React from "react";
import AddressBook from "./AddressBook";

const AccountInformation = () => {
  return (
    <article>
      <h2 className="h4 fw-bold mb-3">Account Information</h2>
      <hr className="mb-4" />

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="mb-4">
            <h3 className="h6 fw-bold mb-3">Contact Information</h3>
            <p className="text-secondary mb-3">
              Alex Driver
              <br />
              ExampeAdress@gmail.com
            </p>
            <div className="d-flex gap-3">
              <a
                href="#"
                className="text-primary text-decoration-underline small"
              >
                Edit
              </a>
              <a
                href="#"
                className="text-primary text-decoration-underline small"
              >
                Change Password
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="mb-4">
            <h3 className="h6 fw-bold mb-3">Newsletters</h3>
            <p className="text-secondary mb-3">
              You don't subscribe to our newsletter.
            </p>
            <a
              href="#"
              className="text-primary text-decoration-underline small"
            >
              Edit
            </a>
          </div>
        </div>
      </div>

      <AddressBook />
    </article>
  );
};

export default AccountInformation;
