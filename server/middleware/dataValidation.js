const { isNumeric } = require('validator');
const xss = require('xss');

function sanitizeRequestBody(req) {
  const sanitizedBody = {};
  const body = req.body;

  for (const key in body) {
    if (Object.hasOwnProperty.call(body, key)) {
      const value = body[key];

      // Use isNumeric to check if the value is numeric
      if (key === 'price' || key === 'discountPrice') {
        if (isNumeric(value)) {
          // If it's numeric, apply XSS sanitization
          sanitizedBody[key] = xss(value);
        } else {
          // Handle validation error
          throw new Error(`${key} must be a numeric value`);
        }
      } else {
        // For other fields, apply XSS sanitization directly
        sanitizedBody[key] = xss(value);
      }
    }
  }

  return sanitizedBody;
}
module.exports = {
    sanitizeRequestBody
}