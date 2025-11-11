import request from 'supertest';
import { createApp, startServer } from './app';

describe('App', () => {
  it('should respond to GET /health with status 200 and correct body', async () => {
    const app = createApp();

    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'healthy');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
    expect(typeof res.body.timestamp).toBe('string');
    expect(typeof res.body.uptime).toBe('number');
  });
});

describe('startServer', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should start the server in development mode', () => {
    const app = createApp();

    // Mock app.startServer and https.createServer
    const listenMock = jest.fn((_port: number, _host: string, cb: () => void) =>
      cb()
    );
    const httpsCreateServerMock = jest
      .spyOn(require('https'), 'createServer')
      .mockReturnValue({
        listen: listenMock,
      });

    // Mock fs.readFileSync to avoid file system errors
    jest.spyOn(require('fs'), 'readFileSync').mockReturnValue('dummy');

    startServer(app);

    expect(httpsCreateServerMock).toHaveBeenCalled();
    expect(listenMock).toHaveBeenCalledWith(
      3000,
      'localhost',
      expect.any(Function)
    );
  });

  it('should fallback to HTTP if SSL certificates are not found', () => {
    process.env.NODE_ENV = 'development';
    const app = createApp();

    // Mock fs.readFileSync to throw (simulate missing cert)
    jest.spyOn(require('fs'), 'readFileSync').mockImplementation(() => {
      throw new Error('File not found');
    });

    // Mock app.startServer
    const appListenMock = jest
      .spyOn(app, 'listen')
      // @ts-expect-error ignore type error for mock implementation
      .mockImplementation((_port: number, _host: string, cb: () => void) => {
        cb();
      });

    // Mock https.createServer to ensure it's not called
    const httpsCreateServerMock = jest.spyOn(require('https'), 'createServer');

    const host = 'localhost';
    const port = 3000;

    startServer(app);

    expect(console.log).toHaveBeenCalledWith(
      'SSL certificates not found, falling back to HTTP'
    );

    expect(httpsCreateServerMock).not.toHaveBeenCalled();
    expect(appListenMock).toHaveBeenCalledWith(
      port,
      host,
      expect.any(Function)
    );
    expect(console.log).toHaveBeenCalledWith(
      `[ ready ] http://${host}:${port}`
    );
  });

  it('uses custom host and port', () => {
    const host = '127.0.0.1';
    const port = 5000;

    process.env.NODE_ENV = 'development';
    process.env.HOST = host;
    process.env.PORT = String(port);

    const app = createApp();

    // Mock app.startServer and https.createServer
    const listenMock = jest.fn((_port: number, _host: string, cb: () => void) =>
      cb()
    );
    const httpsCreateServerMock = jest
      .spyOn(require('https'), 'createServer')
      .mockReturnValue({
        listen: listenMock,
      });

    // Mock fs.readFileSync to avoid file system errors
    jest.spyOn(require('fs'), 'readFileSync').mockReturnValue('dummy');

    startServer(app);

    expect(httpsCreateServerMock).toHaveBeenCalled();
    expect(listenMock).toHaveBeenCalledWith(port, host, expect.any(Function));
    expect(console.log).toHaveBeenCalledWith(
      `[ ready ] https://${host}:${port}`
    );
  });
});
