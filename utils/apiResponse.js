import { StatusCodes } from "./statusCodes.js";

export const sendResponse = (res, {
  code = StatusCodes.OK.code,       // default HTTP status code
  message = StatusCodes.OK.message, // default message
  data = null,
  errors = null,
  validation = true
}) => {
  // `status` is true for 2xx, false otherwise
  const isSuccess = code >= 200 && code < 300;

  return res.status(code).json({
    status: isSuccess,
    validation,
    message,
    data,
    errors,
  });
};