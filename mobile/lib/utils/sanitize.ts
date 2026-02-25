export function sanitizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x00-\x7F]/g, '');
}

export function sanitizeForIPFS<T extends object>(obj: T): T {
  const result = { ...obj } as Record<string, unknown>;

  for (const key in result) {
    const value = result[key];
    if (typeof value === 'string') {
      result[key] = sanitizeText(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeForIPFS(value as object);
    }
  }

  return result as T;
}
