import request from 'supertest';
import express from 'express';
import healthRouter from './healthRouter';

describe('Health route', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(healthRouter);
  });

  it('should return 200 and health status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'healthy');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
    expect(typeof res.body.timestamp).toBe('string');
    expect(typeof res.body.uptime).toBe('number');
  });
});
