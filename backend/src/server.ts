import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { connectDb } from './db/mongoose';
import { initSocket } from './realtime/socket';

async function main(): Promise<void> {
  await connectDb();

  const app = createApp();
  const server = http.createServer(app);
  initSocket(server);

  server.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[server] failed to start', err);
  process.exit(1);
});
