import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DefaultLayout from "@/layouts/DafaultLayout/DefaultLayout";
import { publicRoutes } from "@/routes/routes";
import "./App.css";
import { ToastContainer, toast } from 'react-toastify';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          {publicRoutes.map((route, index) => {
            const Page = route.component;
            return (
              <Route
                key={index}
                path={route.path}
                element={
                  <DefaultLayout>
                    <Page />
                  </DefaultLayout>
                }
              />
            );
          })}
        </Routes>
      </div>
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
    </Router>
  );
}

export default App;
