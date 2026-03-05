export function sanitizeStringForFileName(value: string) {
  const MAX_FILENAME_LENGTH = 120; // Safe buffer for Windows paths

  // 1. Sanitize forbidden chars
  let safe = value.replace(/[?*<>:"/\\|]/g, "-");

  // 2. Truncate if too long, leaving room for the extension
  if (safe.length > MAX_FILENAME_LENGTH) {
    safe = safe.substring(0, MAX_FILENAME_LENGTH).trim();
  }

  return safe.trim();
}
