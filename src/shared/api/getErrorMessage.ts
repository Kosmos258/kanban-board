// Превращает любую ошибку RTK Query в понятный текст для пользователя
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const e = error as { status?: unknown; data?: unknown; error?: unknown };

    if (e.status === 'FETCH_ERROR') {
      return 'Нет связи с сервером. Проверьте подключение.';
    }
    if (e.status === 'PARSING_ERROR') {
      return 'Сервер вернул непонятный ответ.';
    }
    if (typeof e.data === 'object' && e.data !== null) {
      const { error: message } = e.data as { error?: unknown };
      if (typeof message === 'string') return message;
    }
    if (e.status === 503) return 'Сервер временно недоступен.';
    if (typeof e.status === 'number' && e.status >= 500) {
      return 'Ошибка на сервере. Попробуйте позже.';
    }
    if (typeof e.error === 'string') return e.error;
  }
  return 'Что-то пошло не так.';
}
