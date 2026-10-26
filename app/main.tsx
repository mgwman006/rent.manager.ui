import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AccountProvider } from "./store/account/AccountContext";
import { RentalProfileProvider } from "./store/rentalprofile/RentalProfileContext";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AccountProvider>
      <RentalProfileProvider>
        <App />
      </RentalProfileProvider>
    </AccountProvider>
  </React.StrictMode>
);
