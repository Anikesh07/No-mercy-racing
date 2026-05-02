import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./pages/App.jsx";
import Admin from "./pages/Admin.jsx";
import Fixtures from "./pages/Fixtures.jsx";
import Home from "./pages/Home.jsx";
import LeaderboardsPage from "./pages/LeaderboardsPage.jsx";
import Register from "./pages/Register.jsx";
import Rules from "./pages/Rules.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="register" element={<Register />} />
          <Route path="leaderboards" element={<LeaderboardsPage />} />
          <Route path="fixtures" element={<Fixtures />} />
          <Route path="rules" element={<Rules />} />
        </Route>
        <Route path="/admin-control-x9k2" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
