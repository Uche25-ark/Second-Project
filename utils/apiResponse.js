export const sendResponse = (
  res,
  {
    status = true,
    validation = false,
    message = "",
    data = null,
    errors = null,
    code = 1000 // custom code
  },
  statusCode = 200 // HTTP status
) => {
  return res.status(statusCode).json({
    status,
    validation,
    message,
    code,
    data,
    errors
  });
};