import serverlessExpress from 'serverless-http';
import { createApp, startServer } from './app';

const app = createApp();

if (process.env.NODE_ENV === 'development') {
  startServer(app);
}

export const handler = serverlessExpress(app);
