import type { Express } from 'express';

describe('main.ts entrypoint', () => {
  let mockServerless: jest.Mock;
  let createApp: jest.Mock;
  let startServer: jest.Mock;
  const mockApp = {} as Express;

  beforeEach(() => {
    jest.resetModules();

    // re-mock after reset
    jest.doMock('serverless-http', () => jest.fn());
    jest.doMock('./app', () => ({
      createApp: jest.fn(),
      startServer: jest.fn(),
    }));

    mockServerless = require('serverless-http') as jest.Mock;
    const actualApp = require('./app');

    createApp = actualApp.createApp;
    startServer = actualApp.startServer;

    mockServerless.mockReturnValue('mockHandler');
    createApp.mockReturnValue(mockApp);
  });

  it('creates app and passes it to serverlessExpress', async () => {
    const mod = await import('./main.js');

    expect(createApp).toHaveBeenCalledTimes(1);
    expect(mockServerless).toHaveBeenCalledWith(mockApp);
    expect(mod.handler).toBe('mockHandler');
  });

  it('starts server only in development', async () => {
    process.env.NODE_ENV = 'development';
    const mod = await import('./main.js');

    expect(startServer).toHaveBeenCalledWith(mockApp);
    expect(mod.handler).toBe('mockHandler');
  });

  it('does not start server in production', async () => {
    process.env.NODE_ENV = 'production';
    await import('./main.js');

    expect(startServer).not.toHaveBeenCalled();
  });
});
