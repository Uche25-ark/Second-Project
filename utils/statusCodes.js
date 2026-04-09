export class StatusCodes {
  static OK = 200;
  static CREATED = 201;

  // Client errors
  static BAD_REQUEST = 400;
  static UNAUTHORIZED = 401;
  static FORBIDDEN = 403;
  static NOT_FOUND = 404;
  static CONFLICT = 409;
  static UNPROCESSABLE_ENTITY = 422;

  // Server
  static INTERNAL_SERVER_ERROR = 500;

  static getMessage(code) {
    const map = {
      200: "Success",
      201: "Created successfully",
      400: "Bad request",
      401: "Unauthorized",
      403: "Forbidden",
      404: "Not found",
      409: "Conflict",
      422: "Validation error",
      500: "Internal server error",
    };

    return map[code] || "Unknown status";
  }
}