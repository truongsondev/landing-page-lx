import sanitizeHtml from "sanitize-html";

/**
 * Sanitize HTML input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== "string") return input;

  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "escape",
  }).trim();
};

/**
 * Recursively sanitize all string values in an object
 */
export const sanitizeObject = (obj: any): any => {
  if (typeof obj === "string") {
    return sanitizeInput(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj !== null && typeof obj === "object") {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
};

/**
 * Middleware to sanitize request body
 */
export const sanitizeRequestBody = (req: any, res: any, next: any) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
};
