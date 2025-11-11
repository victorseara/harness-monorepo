import { loggerMiddleware } from '@sgwshub/dft-logger-middleware';
import axios from 'axios';
import express, { Application } from 'express';
import fs from 'fs';
import https from 'https';
import path from 'path';
import healthRouter from './routes/health/healthRouter';
import { baseLogger } from './utils/loggerMiddleware';

export function createApp() {
  const app: Application = express();

  app.use(loggerMiddleware(baseLogger));
  app.use(express.json());
  app.use(healthRouter);
  return app;
}

export function startServer(app: Application) {
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;

  // Disabled for development mode only (local development purposes).
  const httpsAgent = new https.Agent({ rejectUnauthorized: false });
  axios.defaults.httpsAgent = httpsAgent;

  try {
    const sslOptions = {
      key: fs.readFileSync(
        path.join(process.cwd(), 'apps/deals-bff/ssl/key.pem')
      ),
      cert: fs.readFileSync(
        path.join(process.cwd(), 'apps/deals-bff/ssl/cert.pem')
      ),
    };

    // Create HTTPS server for local development
    const server = https.createServer(sslOptions, app);

    server.listen(port, host, () => {
      console.log(`[ ready ] https://${host}:${port}`);
    });
  } catch {
    // Fall back to HTTP if SSL certificates are not available
    console.log('SSL certificates not found, falling back to HTTP');

    app.listen(port, host, () => {
      console.log(`[ ready ] http://${host}:${port}`);
    });
  }
}
