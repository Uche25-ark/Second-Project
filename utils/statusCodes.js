export const StatusCodes = {
  // ✅ Success
  OK: { code: 200, message: "OK" },
  CREATED: { code: 201, message: "Resource created successfully" },
  NO_CONTENT: { code: 204, message: "No content" },

  // ⚠️ Client errors
  BAD_REQUEST: { code: 400, message: "Bad request" },
  UNAUTHORIZED: { code: 401, message: "Unauthorized" },
  FORBIDDEN: { code: 403, message: "Forbidden" },
  NOT_FOUND: { code: 404, message: "Resource not found" },
  CONFLICT: { code: 409, message: "Conflict / Duplicate" },
  UNPROCESSABLE_ENTITY: { code: 422, message: "Validation failed" },

  // 🔴 Server errors
  INTERNAL_SERVER_ERROR: { code: 500, message: "Internal server error" },
  SERVICE_UNAVAILABLE: { code: 503, message: "Service unavailable" },
};