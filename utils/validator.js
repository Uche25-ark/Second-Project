export const validateFields = (fields) => {
  const errors = [];

  for (const field of fields) {
    const { name, value, required, type, minLength, pattern } = field;

    if (required && (value === undefined || value === null || value === "")) {
      errors.push(`${name} is required`);
      continue;
    }

    if (type && value !== undefined && typeof value !== type) {
      errors.push(`${name} must be a ${type}`);
      continue;
    }

    if (type === "string" && value) {
      const trimmed = value.trim();

      if (minLength && trimmed.length < minLength) {
        errors.push(`${name} must be at least ${minLength} characters`);
      }

      if (pattern && !pattern.test(trimmed)) {
        errors.push(`${name} is not valid`);
      }
    }
  }

  return errors;
};