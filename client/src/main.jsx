import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import GlobalProvider from "@/context/GlobalProvider";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GlobalProvider>
      <App />
    </GlobalProvider>
  </StrictMode>
);
