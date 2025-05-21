import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  ShoppingBag, 
  Users, 
  Settings, 
  Bell, 
  BarChart, 
  Package,
  FileText
} from "lucide-react";

export default function SideNav() {
  const location = useLocation();

  // Make sure the settings route is linked correctly and active when selected
  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <BarChart className="w-6 h-6" />,
    },
    {
      title: "Orders",
      path: "/orders",
      icon: <ShoppingBag className="w-6 h-6" />,
    },
    {
      title: "Products",
      path: "/products",
      icon: <Package className="w-6 h-6" />,
    },
    {
      title: "Customers",
      path: "/customers",
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "Notifications",
      path: "/notifications",
      icon: <Bell className="w-6 h-6" />,
    },
    {
      title: "Reports",
      path: "/reports",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "Settings",
      path: "/settings",
      icon: <Settings className="w-6 h-6" />,
    },
  ];

  return (
    <aside className="h-screen w-64 border-r bg-white fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
        <nav className="space-y-2">
          {navItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                isActive(item.path)
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
