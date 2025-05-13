
import React from "react";
import AccountSidebar from "../../components/UserAccountDisplay/AccountSidebar";
import AccountInformation from "../../components/UserAccountDisplay/AccountInformation";

const UserAccount = () => {
  return (
    <main className="container-fluid bg-white py-5">
      <div className="container">
        <div className="row">
          <div className="col-md-3">
            <AccountSidebar />
          </div>
          <div className="col-md-9">
            <AccountInformation />
          </div>
        </div>
      </div>
    </main>
  );
};

export default UserAccount;
