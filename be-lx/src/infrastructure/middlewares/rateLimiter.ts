import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// General rate limiter for all requests
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Limit each IP to 20 requests per windowMs
  message: "Quá nhiều lần đăng nhập/đăng ký, vui lòng thử lại sau.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests
});

// Rate limiter for view count increments
export const viewCountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 view increments per hour per post
  message: "Quá nhiều yêu cầu xem, vui lòng thử lại sau.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Create a unique key per IP + post ID
    const requestIp = req.ip ?? req.socket.remoteAddress ?? "unknown";
    return `${ipKeyGenerator(requestIp)}-${req.params.id}`;
  },
});

// Rate limiter for file uploads
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 uploads per windowMs
  message: "Quá nhiều lượt tải lên, vui lòng thử lại sau.",
  standardHeaders: true,
  legacyHeaders: false,
});
