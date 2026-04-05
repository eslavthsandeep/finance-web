/**
 * response.js — Consistent JSON envelope helpers.
 *
 * Every API response follows the same shape:
 *   { success, message?, data?, errors?, meta? }
 *
 * This ensures the frontend always knows what to expect.
 */

/**
 * Send a successful response.
 *
 * @param {Response} res
 * @param {*}        data
 * @param {string}   [message]
 * @param {number}   [statusCode=200]
 * @param {object}   [meta]  - pagination info, etc.
 */
function sendSuccess(res, data = null, message = 'Success', statusCode = 200, meta = null) {
  const body = { success: true, message };
  if (data  !== null) body.data = data;
  if (meta  !== null) body.meta = meta;
  return res.status(statusCode).json(body);
}

/**
 * Send an error response.
 *
 * @param {Response} res
 * @param {string}   message
 * @param {number}   [statusCode=500]
 * @param {Array}    [errors]  - validation errors array
 */
function sendError(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
  const body = { success: false, message };
  if (errors !== null) body.errors = errors;
  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess, sendError };
