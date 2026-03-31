class AppError extends Error {
  constructor(
    message,
    httpCode = 500,
    customCode = 1500,
    options = {}
  ) {
    super(message);

    this.httpCode = httpCode;
    this.customCode = customCode;
    this.validation = options.validation || false;
    this.errors = options.errors || null;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;