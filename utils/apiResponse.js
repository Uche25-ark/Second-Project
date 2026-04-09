import { StatusCodes } from "./statusCodes.js";

export const sendResponse = (res, options = {}) => {
  const {
    code = StatusCodes.OK.code,
    message = StatusCodes.getMessage(code),
    data = null,
    errors = null,
    validation = false
  } = options;

  const isSuccess = code >= 200 && code < 300;

  return res.status(code).json({
    status: isSuccess,
    validation,
    message,
    data,
    errors,
  });
};