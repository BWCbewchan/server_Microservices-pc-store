import GlobalProvider from "@/context/GlobalProvider";
import "bootstrap/dist/css/bootstrap.min.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { setupTokenRefresher } from './utils/tokenRefresher';

// Set up token refresher before rendering the app
setupTokenRefresher();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GlobalProvider>
      <App />
    </GlobalProvider>
  </StrictMode>
);
