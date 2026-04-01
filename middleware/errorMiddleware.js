import { sendResponse } from "../utils/apiResponse.js";

export const errorHandler = (err, req, res, next) => {
  const code = res.statusCode === 200
    ? StatusCodes.INTERNAL_SERVER_ERROR.code
    : res.statusCode;

  return sendResponse(res, {
    code,
    validation: false,
    message: err.message || "Server Error",
    errors: err.message,
  });
};