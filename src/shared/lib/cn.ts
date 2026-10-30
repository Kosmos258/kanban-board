// Склеивает имена классов, пропуская пустые значения
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}
