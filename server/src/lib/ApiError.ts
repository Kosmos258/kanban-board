// Ошибка, которую мы выбрасываем сами, когда хотим вернуть клиенту конкретный статус
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
