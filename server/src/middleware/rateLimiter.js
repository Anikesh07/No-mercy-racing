import rateLimit from "express-rate-limit";

/* =========================
   🛡️ RATE LIMITER
========================= */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased to 1000 to accommodate admin chat polling
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});
