export function sanitizeInput(value: string): string {
  return value
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function sanitizeFormData<T extends Record<string, unknown>>(data: T): T {
  const result = { ...data };
  for (const key in result) {
    if (typeof result[key] === "string") {
      (result as Record<string, unknown>)[key] = sanitizeInput(result[key] as string);
    }
  }
  return result;
}