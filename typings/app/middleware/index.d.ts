// This file is created by egg-ts-helper@1.26.0
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportCustomError from '../../../app/middleware/customError';
import ExportJwtTest from '../../../app/middleware/jwtTest';
import ExportMyLogger from '../../../app/middleware/myLogger';

declare module 'egg' {
  interface IMiddleware {
    customError: typeof ExportCustomError;
    jwtTest: typeof ExportJwtTest;
    myLogger: typeof ExportMyLogger;
  }
}
