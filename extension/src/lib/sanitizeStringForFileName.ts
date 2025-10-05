export default function sanitizeStringForFileName(value: string) {
  // Remove invalid characters
  value = value.trim();
  value = value.replace(/[^a-zA-Z0-9._\- ]/g, "_");
  // Limit length
  if (value.length > 100) {
    value = value.slice(0, 100);
    value = value.trim();
  }
  return value;
}
