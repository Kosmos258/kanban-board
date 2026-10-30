// Абсолютный адрес нужен, потому что fetch в тестах (Node) не понимает относительные URL
export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  `${window.location.origin}/api`;
