const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/token');

// Checks the "Authorization: Bearer <token>" header and loads the user from the database.
const protect = asyncHandler(async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) throw new ApiError(401, 'Authentication required. Please log in.');

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    throw new ApiError(401, 'Your session is invalid or has expired. Please log in again.');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(401, 'This account no longer exists.');
  req.user = user;
  next();
});

module.exports = { protect };
