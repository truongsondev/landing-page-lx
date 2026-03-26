import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import postRoutes from "./routes/post.routes";
import memberRoutes from "./routes/member.routes";
import activityRoutes from "./routes/activity.routes";
import mealSignUpRoutes from "./routes/mealSignUp.routes";
import { errorHandler } from "@infrastructure/middlewares/errorHandler";
import { sanitizeRequestBody } from "@infrastructure/middlewares/sanitize";
import { generalLimiter } from "@infrastructure/middlewares/rateLimiter";

dotenv.config();

const app = express();

// Security Middlewares
app.use(helmet()); // Set security headers
app.use(generalLimiter); // Apply rate limiting to all requests

// CORS configuration - restrict to specific origins in production
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.ALLOWED_ORIGINS?.split(",") || []
      : "*",
  credentials: true,
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Input sanitization - protect against XSS
app.use(sanitizeRequestBody);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/meal-signups", mealSignUpRoutes);

// Error handler
app.use(errorHandler);

export default app;
