const BreadcrumbNav = () => {
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb mb-4" style={{ fontSize: "12px", fontWeight: "600" }}>
        <li className="breadcrumb-item">Home</li>
        <li className="breadcrumb-item">Laptops</li>
        <li className="breadcrumb-item">MSI Prestige Series</li>
        <li className="breadcrumb-item" aria-current="page" style={{ color: "#A2A6B0" }}>
          MSI WS Series
        </li>
      </ol>
    </nav>
  );
};

export default BreadcrumbNav;
