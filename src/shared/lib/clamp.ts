// Та же логика, что на сервере: позиция вне диапазона приводится к допустимой
export function clamp(value: number, max: number): number {
  return Math.min(Math.max(value, 0), Math.max(max, 0));
}
