import Dashboard from "@/pages/Dashboard/Dashboard";
import TableOrders from "@/pages/Orders/TableOrders";
import ProductPage from "@/pages/Products/ProductPage";
import NotificationPage from "@/pages/Notification/NotificationPage";
import CustomersPage from "@/pages/Customers/CustomersPage";
import Settings from "@/pages/Settings/Settings";

const routes = [
  { path: "/dashboard", component: Dashboard, label: "Dashboard" },
  { path: "/orders", component: TableOrders, label: "Orders" },
  { path: "/products", component: ProductPage, label: "Products" },
  { path: "/customers", component: CustomersPage, label: "Customers" },
  { path: "/notifications", component: NotificationPage, label: "Notifications" },
  { path: "/settings", component: Settings, label: "Settings" }
];

export { routes };
