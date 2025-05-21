import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";
import GlobalProvider from "./context/GlobalProvider";
import SideNav from "@/components/SideNav";
import LoginPage from "@/pages/Auth/LoginPage";
import TableOrders from "@/pages/Orders/TableOrders";
import Dashboard from "@/pages/Dashboard/Dashboard";
import ProductPage from "@/pages/Products/ProductPage";
import NotificationPage from "@/pages/Notification/NotificationPage";
import CustomersPage from "@/pages/Customers/CustomersPage";
import Settings from "@/pages/Settings/Settings";
import { useEffect, useState } from "react";

// Simple Protected Route component
function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Check for authentication token in localStorage
    const token = localStorage.getItem("adminToken");
    const user = localStorage.getItem("adminUser");

    setIsAuthenticated(!!token && !!user);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login with the current path saved in state
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

// Route that redirects authenticated users away from public pages like login
function PublicRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Check for authentication token in localStorage
    const token = localStorage.getItem("adminToken");
    const user = localStorage.getItem("adminUser");

    setIsAuthenticated(!!token && !!user);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect to dashboard or the page they were trying to access before
    const from = location.state?.from || "/dashboard";
    return <Navigate to={from} replace />;
  }

  return children;
}

function App() {
  return (
    <GlobalProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router>
          <Routes>
            {/* Public routes - will redirect to dashboard if already logged in */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gray-50">
                    <SideNav />
                    <div className="ml-64">
                      <main className="p-4">
                        <Routes>
                          {/* Redirect to dashboard by default */}
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />

                          {/* Dashboard route */}
                          <Route path="/dashboard" element={<Dashboard />} />

                          {/* Existing routes */}
                          <Route path="/orders" element={<TableOrders />} />
                          <Route path="/products" element={<ProductPage />} />
                          <Route path="/notifications" element={<NotificationPage />} />
                          <Route path="/customers" element={<CustomersPage />} />
                          <Route path="/settings" element={<Settings />} />

                          {/* Add other routes as needed */}
                          <Route path="*" element={<div>Not Found</div>} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster position="top-center" />
        </Router>
      </ThemeProvider>
    </GlobalProvider>
  );
}

export default App;
