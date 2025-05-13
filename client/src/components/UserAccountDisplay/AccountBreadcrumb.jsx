const AccountBreadcrumb = () => {
    return (
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item">Home</li>
          <li className="breadcrumb-item active" aria-current="page">
            My Dashboard
          </li>
        </ol>
      </nav>
    );
  };
  
  export default AccountBreadcrumb;
  