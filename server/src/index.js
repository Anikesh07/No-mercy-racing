import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import mongoose from "mongoose";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import publicRoutes from "./routes/public.js";
import teamRoutes from "./routes/teams.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================
   🔐 ENV VALIDATION
========================= */
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env");
  process.exit(1);
}

/* =========================
   🌍 CORS SETUP
========================= */
const envOrigin = process.env.CLIENT_ORIGIN;
const allowedOrigins = [
  "https://no-mercy-racing-3vbd.vercel.app", // Deployed Frontend
  "http://localhost:5173", // Local Frontend
  "http://localhost:5000"
];

if (envOrigin && !allowedOrigins.includes(envOrigin)) {
  allowedOrigins.push(envOrigin);
}

app.use(cors({ origin: allowedOrigins, credentials: true }));

/* =========================
   🧱 MIDDLEWARE
========================= */
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Important for serving images
app.use(express.json({ limit: "5mb" }));
app.use(mongoSanitize());
app.use(compression());

if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "uploads"))
);

/* =========================
   🚦 ROUTES
========================= */
// Apply rate limiter to all API routes
app.use("/api", apiLimiter);

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, name: "No Mercy Racing League API" })
);

app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", publicRoutes);

// Centralized error handler should be last
app.use(errorHandler);

/* =========================
   🚀 SERVER START
========================= */
const port = process.env.PORT || 5000;

/* =========================
   🗄️ MONGODB CONNECTION
========================= */
mongoose
  .connect(process.env.MONGO_URI, {
    // optional but nice
    autoIndex: true,
  })
  .then(() => {
    console.log("✅ MongoDB Atlas connected");

    const server = app.listen(port, () => {
      console.log(`🚀 NMRL API running on port ${port}`);
    });

    /* =========================
       🛑 GRACEFUL SHUTDOWN
    ========================= */
    const shutdown = async () => {
      console.log("🛑 Shutting down gracefully...");
      server.close(async () => {
        console.log("✅ HTTP server closed.");
        try {
          await mongoose.connection.close();
          console.log("✅ MongoDB connection closed.");
          process.exit(0);
        } catch (err) {
          console.error("❌ Error during MongoDB disconnect:", err);
          process.exit(1);
        }
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:");
    console.error(error.message);
    process.exit(1);
  });

/* =========================
   💀 GLOBAL ERROR HANDLER & KEEP-ALIVE
========================= */
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

// Trick Render into staying awake
if (process.env.NODE_ENV === "production" && process.env.RENDER_EXTERNAL_URL) {
  const pingUrl = `${process.env.RENDER_EXTERNAL_URL}/api/health`;
  setInterval(() => {
    https.get(pingUrl, (res) => {
      console.log(`📡 Keep-Alive Ping sent to ${pingUrl} (Status: ${res.statusCode})`);
    }).on("error", (err) => {
      console.error(`❌ Keep-Alive Ping failed:`, err.message);
    });
  }, 10 * 60 * 1000); // 10 minutes
}