import React from "react";
import AccountBreadcrumb from "./AccountBreadcrumb";
import SidebarMenu from "./SidebarMenu";

const AccountSidebar = () => {
  return (
    <aside>
      <AccountBreadcrumb />
      <h1 className="h3 fw-semibold mb-4">My Dashboard</h1>
      <SidebarMenu />

      <div className="card mt-3 bg-light">
        <div className="card-body text-center">
          <h2 className="h6 fw-bold">Compare Products</h2>
          <p className="small mt-3 mb-0">You have no items to compare.</p>
        </div>
      </div>

      <div className="card mt-3 bg-light">
        <div className="card-body text-center">
          <h2 className="h6 fw-bold">My Wish List</h2>
          <p className="small mt-3 mb-0">
            You have no items in your wish list.
          </p>  
        </div>
      </div>
    </aside>
  );
};

export default AccountSidebar;
