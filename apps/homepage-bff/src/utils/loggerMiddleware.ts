import { Logger, NodeTransport, SEVERITY } from '@sgwshub/dft-logger';
import packageJson from '../../package.json';
import { type Request } from 'express';
import { createRequestLogger } from '@sgwshub/dft-logger-middleware';

const NODE_ENV = process.env.NODE_ENV;
const APP_ENV = process.env.APP_ENV || 'dev';

export const baseLogger = new Logger({
  appName: packageJson.name,
  appType: 'BFF',
  appVersion: packageJson.version,
  appEnvironment: APP_ENV,
  runtime: 'node',
  enableDevelopmentWarnings: NODE_ENV === 'development',
  transports: [
    new NodeTransport({
      logLevel: NODE_ENV === 'development' ? SEVERITY.DEBUG : SEVERITY.INFO,
      stringify: NODE_ENV === 'development', // JSON in dev, raw objects in prod
    }),
  ],
});

/**
 * Get a request-scoped logger that includes request-specific context.
 * @param req Express request object
 * @returns Request-scoped logger
 *
 * Please refer to the the package's documentation for more details:
 * - {@link https://github.com/sgwshub/de-foundations/pkgs/npm/dft-logger-middleware DFT Logger Middleware}
 * - {@link https://github.com/sgwshub/de-foundations/pkgs/npm/dft-logger DFT Logger}
 */
export function getRequestLogger(req: Request) {
  return createRequestLogger(req, baseLogger);
}
