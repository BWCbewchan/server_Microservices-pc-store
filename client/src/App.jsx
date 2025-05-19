import { Suspense } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import DefaultLayout from './layouts';
import { privateRoutes, publicRoutes } from './routes/routes';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            {publicRoutes.map((route, index) => {
              const Page = route.component;
              const Layout = route.layout || DefaultLayout;

              return (
                <Route
                  key={index}
                  path={route.path}
                  element={
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Page />
                      </Suspense>
                    </Layout>
                  }
                />
              );
            })}

            {/* Private Routes (Cần đăng nhập) */}
            {privateRoutes.map((route, index) => {
              const Page = route.component;
              const Layout = route.layout || DefaultLayout;

              return (
                <Route
                  key={index}
                  path={route.path}
                  element={
                    <PrivateRoute>
                      <Layout>
                        <Suspense fallback={<div>Loading...</div>}>
                          <Page />
                        </Suspense>
                      </Layout>
                    </PrivateRoute>
                  }
                />
              );
            })}
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
