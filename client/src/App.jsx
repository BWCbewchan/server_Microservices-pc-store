import { Suspense, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import DefaultLayout from './layouts';
import { privateRoutes, publicRoutes } from './routes/routes';
import ChatBox from './components/ChatBox/ChatBox';
import ICONS from './constants/icons';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

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

          {/* Chat Button */}
          <div className="position-fixed bottom-0 end-0 mx-2 my-4" style={{ zIndex: 1000 }}>
            <button

              onClick={() => setIsChatOpen(true)}
            >
              <span style={{ fontSize: "14px", fontWeight: "bold" }}>AI</span>
            </button>
          </div>

          {/* Chat Box */}
          <ChatBox
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />

          {/* Toast Container */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
