export const extractPublicId = (url) => {
  const parts = url.split("/");
  const file = parts[parts.length - 1];
  return "products/" + file.split(".")[0];
};