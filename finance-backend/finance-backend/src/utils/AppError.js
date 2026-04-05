/**
 * AppError — Structured operational error with HTTP status code.
 *
 * Distinguishes between expected "operational" errors (e.g. 404 Not Found,
 * 403 Forbidden) and unexpected programming errors so the global error
 * handler can respond appropriately.
 */
class AppError extends Error {
  /**
   * @param {string}  message    Human-readable error message
   * @param {number}  statusCode HTTP status code (default 500)
   * @param {string}  [code]     Optional short machine-readable code
   */
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode  = statusCode;
    this.code        = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
