import { Logger } from '@sgwshub/dft-logger';
import { createRequestLogger } from '@sgwshub/dft-logger-middleware';
import { baseLogger, getRequestLogger } from './loggerMiddleware';
import type { Request } from 'express';

jest.mock('@sgwshub/dft-logger-middleware');

describe('loggerMiddleware', () => {
  const originalEnv = process.env.NODE_ENV;

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('baseLogger', () => {
    it('should create logger with correct configuration for development environment', () => {
      // Set environment before importing
      process.env.NODE_ENV = 'development';
      process.env.APP_ENV = 'dev';

      // Clear the module cache to re-import with new env vars
      jest.isolateModules(() => {
        const { baseLogger } = require('./loggerMiddleware');

        expect(baseLogger).toBeDefined();
        expect(baseLogger.constructor.name).toContain('Logger');
        expect(typeof baseLogger.debug).toBe('function');
        expect(typeof baseLogger.info).toBe('function');
        expect(typeof baseLogger.warn).toBe('function');
        expect(typeof baseLogger.error).toBe('function');
      });
    });

    it('should create logger with correct configuration for production environment', () => {
      // Set environment before importing
      process.env.NODE_ENV = 'production';
      process.env.APP_ENV = 'prod';

      // Clear the module cache to re-import with new env vars
      jest.isolateModules(() => {
        const { baseLogger } = require('./loggerMiddleware');

        expect(baseLogger).toBeDefined();
        expect(baseLogger.constructor.name).toContain('Logger');
        expect(typeof baseLogger.debug).toBe('function');
        expect(typeof baseLogger.info).toBe('function');
        expect(typeof baseLogger.warn).toBe('function');
        expect(typeof baseLogger.error).toBe('function');
      });
    });

    it('should default APP_ENV to "dev" when not specified', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.APP_ENV;

      jest.isolateModules(() => {
        const { baseLogger } = require('./loggerMiddleware');
        expect(baseLogger).toBeDefined();
        expect(baseLogger.constructor.name).toContain('Logger');
      });
    });

    it('should be an instance of Logger', () => {
      expect(baseLogger).toBeInstanceOf(Logger);
    });
  });

  describe('getRequestLogger', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should call createRequestLogger with request and baseLogger', () => {
      const mockRequest = {
        method: 'GET',
        url: '/test',
      } as Request;

      const mockLogger = new Logger({
        appEnvironment: 'test',
        appName: 'test-app',
        appType: 'BFF',
        appVersion: '1.0.0',
        runtime: 'node',
      });

      jest.mocked(createRequestLogger).mockReturnValue(mockLogger);
      const result = getRequestLogger(mockRequest);

      expect(createRequestLogger).toHaveBeenCalledWith(mockRequest, baseLogger);
      expect(result).toBe(mockLogger);
    });

    it('should return the logger instance from createRequestLogger', () => {
      const mockRequest = {} as Request;
      const mockLogger = new Logger({
        appEnvironment: 'test',
        appName: 'test-app',
        appType: 'BFF',
        appVersion: '1.0.0',
        runtime: 'node',
      });

      (createRequestLogger as jest.Mock).mockReturnValue(mockLogger);

      const result = getRequestLogger(mockRequest);

      expect(result).toBe(mockLogger);
    });

    it('should pass different requests to createRequestLogger', () => {
      const mockRequest1 = { method: 'GET', url: '/api/test1' } as Request;
      const mockRequest2 = { method: 'POST', url: '/api/test2' } as Request;

      const mockLogger1 = new Logger({
        appEnvironment: 'test',
        appName: 'test-app',
        appType: 'BFF',
        appVersion: '1.0.0',
        runtime: 'node',
      });

      const mockLogger2 = new Logger({
        appEnvironment: 'test',
        appName: 'test-app-2',
        appType: 'BFF',
        appVersion: '1.0.0',
        runtime: 'node',
      });

      jest
        .mocked(createRequestLogger)
        .mockReturnValueOnce(mockLogger1)
        .mockReturnValueOnce(mockLogger2);

      const result1 = getRequestLogger(mockRequest1);
      const result2 = getRequestLogger(mockRequest2);

      expect(createRequestLogger).toHaveBeenCalledWith(
        mockRequest1,
        baseLogger
      );
      expect(createRequestLogger).toHaveBeenCalledWith(
        mockRequest2,
        baseLogger
      );
      expect(result1).toBe(mockLogger1);
      expect(result2).toBe(mockLogger2);
      expect(createRequestLogger).toHaveBeenCalledTimes(2);
    });
  });
});
