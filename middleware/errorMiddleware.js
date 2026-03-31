import { sendResponse } from "../utils/apiResponse.js";

export const errorHandler = (err, req, res, next) => {
  const code = res.statusCode === 200 ? 500 : res.statusCode;
  return sendResponse(res, {
    status: false,
    validation: false,
    message: err.message || "Server Error",
    code
  });
};