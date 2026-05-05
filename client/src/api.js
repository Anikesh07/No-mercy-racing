import axios from "axios";

/* =========================
   🌐 BASE API INSTANCE
========================= */
const isDev = import.meta.env.DEV;
const defaultAPI = isDev 
  ? "http://localhost:5000/api" 
  : "https://nmrl-backend.onrender.com/api";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultAPI,
  timeout: 10000, // ⏱️ prevent hanging requests
});

/* =========================
   🔐 REQUEST INTERCEPTOR
========================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("nmrl_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

/* =========================
   📥 RESPONSE INTERCEPTOR
========================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ API Error:", error.response || error.message);

    // 🔐 Handle unauthorized (token expired / invalid)
    if (error.response?.status === 401 && !error.config?.url?.includes("/login")) {
      localStorage.removeItem("nmrl_token");
      window.location.reload(); // Reload to reset auth state instead of redirecting to non-existent /login
    }

    // 🌐 Server down / network issue
    if (!error.response) {
      alert("⚠️ Server not reachable. Check backend.");
    }

    return Promise.reject(error);
  }
);