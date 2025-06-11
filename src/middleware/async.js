/**
 * Async Handler for wrapping async/await routes in Express
 * This eliminates the need to write try-catch blocks in each route handler
 * @param {Function} fn - The async function to be wrapped
 * @returns {Function} - A middleware function that handles promises
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;