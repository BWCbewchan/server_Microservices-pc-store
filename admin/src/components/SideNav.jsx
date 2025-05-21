import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Home,
  ShoppingBag,
  Users,
  Settings,
  Bell,
  BarChart,
  Package,
  FileText,
  LogOut,
  User
} from "lucide-react";

export default function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get user from localStorage
  const userString = localStorage.getItem("adminUser");
  const user = userString ? JSON.parse(userString) : null;

  // Handle logout
  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    // Display success message
    toast.success("Đăng xuất thành công");

    // Redirect to login page
    navigate("/login");
  };

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
              className={`flex items-center px-3 py-2 rounded-md transition-colors ${isActive(item.path)
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              {item.icon}
              <span className="ml-3">{item.title}</span>
            </Link>
          ))}
        </nav>

        {/* User profile section with logout button */}
        <div className="mt-auto border-t pt-4">
          {user ? (
            <div className="p-3 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="p-3">
              <Link
                to="/login"
                className="w-full flex items-center justify-center p-2 text-sm font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                Đăng nhập
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
