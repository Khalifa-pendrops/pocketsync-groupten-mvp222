export class ApiError extends Error {
  readonly status: number;
  readonly body: Record<string, unknown>;

  constructor(status: number, body: Record<string, unknown> = {}) {
    const message =
      typeof body.error === 'string'
        ? body.error
        : `Request failed with status ${status}`;
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}