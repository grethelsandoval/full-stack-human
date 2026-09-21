import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import LazyDApp from "./dapp/LazyDApp";
import { isDAppPath } from "./dapp/routes";
import "./index.css";
import "./dapp/dapp.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {isDAppPath(window.location.pathname) ? <LazyDApp /> : <App />}
  </React.StrictMode>,
);
