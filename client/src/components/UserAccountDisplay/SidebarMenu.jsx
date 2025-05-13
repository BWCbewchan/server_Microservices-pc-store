const SidebarMenu = () => {
    return (
      <nav className="nav flex-column bg-light p-3">
        <div className="position-relative">
          <div
            className="position-absolute bg-primary"
            style={{ width: "3px", height: "30px", left: "-1rem" }}
          ></div>
        </div>
        <a className="nav-link fw-semibold text-dark" href="#">
          Account Dashboard
        </a>
        <a className="nav-link text-secondary" href="#">
          Account Information
        </a>
        <a className="nav-link text-secondary" href="#">
          Address Book
        </a>
        <a className="nav-link text-secondary" href="#">
          My Orders
        </a>
        <hr className="my-2" />
        <a className="nav-link text-secondary" href="#">
          My Downloadable Products
        </a>
        <a className="nav-link text-secondary" href="#">
          Stored Payment Methods
        </a>
        <a className="nav-link text-secondary" href="#">
          Billing Agreements
        </a>
        <a className="nav-link text-secondary" href="#">
          My Wish List
        </a>
        <hr className="my-2" />
        <a className="nav-link text-secondary" href="#">
          My Product Reviews
        </a>
        <a className="nav-link text-secondary" href="#">
          Newsletter Subscriptions
        </a>
      </nav>
    );
  };
  
  export default SidebarMenu;
  