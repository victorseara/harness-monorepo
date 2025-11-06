import express, { type Router } from 'express';
import { getRequestLogger } from '../../utils/loggerMiddleware';
import { HealthCheckResponse } from './healthTypes';

const router: Router = express.Router();

router.get('/health', (req, res) => {
  const logger = getRequestLogger(req);

  logger.log({
    message: 'Processing health request',
  });

  const response: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };

  res.status(200).json(response);
});

export default router;
