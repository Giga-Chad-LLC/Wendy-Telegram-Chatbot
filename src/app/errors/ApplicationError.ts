
export class ApplicationError extends Error {
  public cause: Error | null;

  constructor(message: string, cause: Error | null = null) {
    super(message);
    this.name = 'ApplicationError';
    this.cause = cause;
  }
}