import express, { type Router } from 'express';
import { HealthCheckResponse } from './healthTypes';

const router: Router = express.Router();

router.get('/health', (req, res) => {
  const response: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };

  res.status(200).json(response);
});

export default router;
