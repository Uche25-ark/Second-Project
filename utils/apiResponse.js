import { StatusCodes } from "./statusCodes.js";

export const sendResponse = (res, {
  code = StatusCodes.OK.code,
  message = StatusCodes.OK.message,
  data = null,
  errors = null,
  validation = true
}) => {
  const isSuccess = code >= 200 && code < 300;

  return res.status(code).json({
    status: isSuccess,
    validation,
    message,
    data,
    errors,
  });
};