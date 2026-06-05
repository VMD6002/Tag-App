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

export function applyConstants(rawString: string, constants: Record<string, string>) {
    return rawString.replace(/\$(\w+)/g, (match, key) => {
        return constants[key] ?? match;
    });
}
export function replaceWithConstantKey(text: string, constants: Record<string, string>) {
    let newText = text;
    for (const [key, value] of Object.entries(constants)) {
        newText = newText.replaceAll(value, key);
    }
    return newText;
}