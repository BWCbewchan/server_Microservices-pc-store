import Overview from "@/pages/Overview/Overview";
import Customers from "@/pages/Cutomers/Customers";
import Products from "@/pages/Products/Products";
import Settings from "@/pages/Settings/Settings";
import Orders from "@/pages/Orders/TableOrders";
const routes = [
  { path: "/overview", component: Overview },
  { path: "/customers", component: Customers },
  { path: "/products", component: Products },
  { path: "/settings", component: Settings },
  { path: "/orders", component: Orders },
];

export { routes };
