const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signToken } = require('../utils/token');
const { validateRegister, validateLogin, hasErrors } = require('../utils/validators');

// POST /api/auth/register  -> always creates a normal "user" (admins are made with the seed script)
exports.register = asyncHandler(async (req, res) => {
  const { errors, value } = validateRegister(req.body);
  if (hasErrors(errors)) throw new ApiError(400, 'Please fix the highlighted fields.', errors);

  const existing = await User.findOne({ email: value.email });
  if (existing) throw new ApiError(409, 'An account with this email already exists.', { email: 'Email already in use.' });

  const user = await User.create({
    name: value.name,
    email: value.email,
    passwordHash: await hashPassword(value.password),
    role: 'user',
  });
  res.status(201).json({ token: signToken(user._id), user: user.toPublic() });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { errors, value } = validateLogin(req.body);
  if (hasErrors(errors)) throw new ApiError(400, 'Please fix the highlighted fields.', errors);

  const user = await User.findOne({ email: value.email }).select('+passwordHash');
  const ok = user ? await verifyPassword(value.password, user.passwordHash) : false;
  if (!ok) throw new ApiError(401, 'Invalid email or password.');

  res.json({ token: signToken(user._id), user: user.toPublic() });
});

// GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toPublic() });
});
