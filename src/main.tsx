import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";


import App from "./App";

import { AuthProvider } from "./context/AuthContext";
import { AccountProvider } from "./context/AccountContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <AccountProvider>
        <App />
      </AccountProvider>
    </AuthProvider>
  </StrictMode>
);


