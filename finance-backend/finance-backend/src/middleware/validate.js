/**
 * validate.js — express-validator result checker.
 *
 * Place this after any chain of check() / body() validators.
 * If there are validation errors it responds immediately with 422 and the list.
 * Otherwise it calls next().
 */

const { validationResult } = require('express-validator');
const { sendError }        = require('../utils/response');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format into a clean array: [{ field, message }]
    const formatted = errors.array().map((e) => ({
      field:   e.path ?? e.param,
      message: e.msg,
    }));
    return sendError(res, 'Validation failed. Please check the highlighted fields.', 422, formatted);
  }
  next();
}

module.exports = validate;
