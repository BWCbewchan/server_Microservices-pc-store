import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import DefaultLayout from "@/layouts/DafaultLayout/DefaultLayout";
import { routes } from "@/routes/routes";
import { ThemeProvider } from "@/components/ui/theme-provider";
import GlobalProvider from "./context/GlobalProvider";
import SideNav from "@/components/SideNav";
import TableOrders from "@/pages/Orders/TableOrders";
import Dashboard from "@/pages/Dashboard/Dashboard";
import ProductPage from "@/pages/Products/ProductPage";
import NotificationPage from "@/pages/Notification/NotificationPage";
import CustomersPage from "@/pages/Customers/CustomersPage";
import Settings from "@/pages/Settings/Settings";


function App() {
  return (
    <GlobalProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router>
          <div className="min-h-screen bg-gray-50">
            <SideNav />
            <div className="ml-64">
              <main className="p-4">
                <Routes>
                  {/* Redirect to dashboard by default */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Dashboard - New route */}
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
            <Toaster position="top-center" />
          </div>
        </Router>
      </ThemeProvider>
    </GlobalProvider>
  );
}

export default App;
