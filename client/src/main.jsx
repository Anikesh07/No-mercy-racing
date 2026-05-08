import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import { Analytics } from "@vercel/analytics/react";

import App from "./pages/App.jsx";
import Admin from "./pages/Admin.jsx";
import Fixtures from "./pages/Fixtures.jsx";
import Home from "./pages/Home.jsx";
import LeaderboardsPage from "./pages/LeaderboardsPage.jsx";
import PovSubmit from "./pages/PovSubmit.jsx";
import Register from "./pages/Register.jsx";
import Rules from "./pages/Rules.jsx";

import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

        {/* =========================
            MAIN APP LAYOUT
        ========================= */}
        <Route path="/" element={<App />}>
          
          {/* HOME */}
          <Route index element={<Home />} />

          {/* PUBLIC PAGES */}
          <Route path="register" element={<Register />} />
          
          <Route
            path="leaderboards"
            element={<LeaderboardsPage />}
          />

          <Route
            path="fixtures"
            element={<Fixtures />}
          />

          <Route
            path="rules"
            element={<Rules />}
          />

          {/* POV SUBMISSION */}
          <Route
            path="pov-submit"
            element={<PovSubmit />}
          />

        </Route>

        {/* =========================
            ADMIN PANEL
        ========================= */}
        <Route
          path="/admin-control-x9k2"
          element={<Admin />}
        />

        {/* =========================
            FALLBACK ROUTE
        ========================= */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

      {/* =========================
          VERCEL ANALYTICS
      ========================= */}
      <Analytics />
      
    </BrowserRouter>
  </React.StrictMode>
);