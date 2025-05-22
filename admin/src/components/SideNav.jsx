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
  User,
  Menu,
  X,
  ChevronLeft
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function SideNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Get user from localStorage
  const userString = localStorage.getItem("adminUser");
  const user = userString ? JSON.parse(userString) : null;

  // Check viewport size and set appropriate states
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);

      // Auto-close sidebar on mobile, auto-collapse on tablet
      if (width < 640) {
        setSidebarOpen(false);
      } else if (width >= 640 && width < 1024) {
        setSidebarOpen(true);
        setIsCollapsed(true);
      } else {
        setSidebarOpen(true);
        setIsCollapsed(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    // Display success message
    toast.success("Đăng xuất thành công");

    // Redirect to login page
    navigate("/login");

    // Close sidebar on mobile after logout
    if (isMobile) {
      setSidebarOpen(false);
    }
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

  // Handle sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // Handle sidebar collapse toggle (for tablet/desktop)
  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  // Handle navigation click - close sidebar on mobile
  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile hamburger menu button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed z-50 top-4 left-4 p-2 bg-white rounded-md shadow-md hover:bg-gray-100"
          aria-label="Toggle navigation menu"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Backdrop overlay (mobile only) */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main sidebar */}
      <aside
        className={`h-screen bg-white border-r fixed z-40 transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'w-[70px]' : 'w-64'}
          ${isMobile ? 'shadow-xl' : ''}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header section - Fixed layout issue */}
          <div className="p-4 border-b flex items-center">
            {/* Logo/title section */}
            <div className={`${isCollapsed ? 'w-full text-center' : 'flex-1'}`}>
              {!isCollapsed && <h1 className="text-xl font-bold truncate">Admin Panel</h1>}
              {isCollapsed && <div className="mx-auto w-fit"><BarChart className="h-6 w-6" /></div>}
            </div>

            {/* Toggle/close buttons */}
            <div className="flex items-center">
              {!isMobile && !isCollapsed && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleCollapse}
                  className="hover:bg-gray-100 ml-2"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}

              {!isMobile && isCollapsed && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleCollapse}
                  className="hover:bg-gray-100 ml-auto"
                  aria-label="Expand sidebar"
                >
                  <ChevronLeft className="h-5 w-5 rotate-180" />
                </Button>
              )}

              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="hover:bg-gray-100 ml-auto"
                  aria-label="Close sidebar"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Navigation links */}
          <nav className={`flex-1 overflow-y-auto py-3 ${isCollapsed ? 'px-2' : 'px-4'}`}>
            <div className="space-y-2">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'px-3'} py-2 rounded-md transition-colors
                    ${isActive(item.path)
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                  title={isCollapsed ? item.title : ""}
                >
                  <span className={`${isCollapsed ? 'mx-auto' : ''}`}>{item.icon}</span>
                  {!isCollapsed && <span className="ml-3">{item.title}</span>}
                </Link>
              ))}
            </div>
          </nav>

          {/* User profile section with logout */}
          <div className={`border-t ${isCollapsed ? 'p-2' : 'p-4'}`}>
            {user ? (
              <div className={`${isCollapsed ? 'text-center' : ''} space-y-3`}>
                {!isCollapsed && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                )}

                {isCollapsed && (
                  <div className="mx-auto mb-2 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center justify-center p-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors
                    ${isCollapsed ? 'px-0' : ''}
                  `}
                  title={isCollapsed ? "Đăng xuất" : ""}
                >
                  <LogOut className={`w-4 h-4 ${isCollapsed ? '' : 'mr-2'}`} />
                  {!isCollapsed && <span>Đăng xuất</span>}
                </button>
              </div>
            ) : (
              <div>
                <Link
                  to="/login"
                  onClick={handleNavClick}
                  className={`w-full flex items-center justify-center p-2 text-sm font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100
                    ${isCollapsed ? 'px-0' : ''}
                  `}
                >
                  {isCollapsed ? <User className="w-5 h-5" /> : "Đăng nhập"}
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Spacer to push content to the right */}
      {(sidebarOpen && !isMobile) && (
        <div className={`${isCollapsed ? 'w-[70px]' : 'w-64'} transition-all duration-300`}></div>
      )}
    </>
  );
}
