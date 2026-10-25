const { loadConfig } = require('./config/env');
const connectDB = require('./config/db');
const createApp = require('./app');

async function start() {
  const config = loadConfig();
  await connectDB(config.mongoUri);
  const app = createApp({ clientUrls: config.clientUrls });
  app.listen(config.port, () => console.log(`ShopSphere API running on port ${config.port}`));
}

start().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
