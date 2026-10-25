require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

function loadConfig() {
  const problems = [];
  if (!process.env.MONGODB_URI) problems.push('MONGODB_URI is missing.');
  if (!process.env.JWT_SECRET) problems.push('JWT_SECRET is missing.');
  else if (isProduction && process.env.JWT_SECRET.length < 32) {
    problems.push('JWT_SECRET must be at least 32 characters in production.');
  }
  if (isProduction && !process.env.CLIENT_URL) problems.push('CLIENT_URL is required in production (CORS).');

  if (problems.length) {
    throw new Error('Configuration error:\n - ' + problems.join('\n - ') + '\nSee backend/.env.example');
  }

  const clientUrls = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((u) => u.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  return {
    isProduction,
    port: Number(process.env.PORT) || 5000,
    mongoUri: process.env.MONGODB_URI,
    clientUrls,
  };
}

module.exports = { loadConfig };
