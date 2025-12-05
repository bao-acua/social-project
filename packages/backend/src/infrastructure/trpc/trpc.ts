import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import {
  ConflictError,
  CreateResourceError,
  PermissionError,
  PreconditionError,
  ResourceNotFoundError,
  ValidationError,
} from '../../lib/errors';
import { Context } from './context';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter(opts) {
    const { shape, error } = opts;

    if (error.cause instanceof PreconditionError) {
      return {
        ...shape,
        message: error.message || shape.message,
        data: {
          ...shape.data,
          code: 'CONFLICT',
          httpStatus: 409,
          stack: '[REDACTED]',
        },
      };
    }
    if (error.cause instanceof ConflictError) {
      return {
        ...shape,
        message: error.message || shape.message,
        data: {
          ...shape.data,
          code: 'CONFLICT',
          httpStatus: 409,
          stack: '[REDACTED]',
        },
      };
    }
    if (error.cause instanceof ResourceNotFoundError) {
      return {
        ...shape,
        message: error.message || shape.message,
        data: {
          ...shape.data,
          code: 'NOT_FOUND',
          httpStatus: 404,
          stack: '[REDACTED]',
        },
      };
    }
    if (error.cause instanceof PermissionError) {
      return {
        ...shape,
        message: error.message || shape.message,
        data: {
          ...shape.data,
          code: 'FORBIDDEN',
          httpStatus: 403,
          stack: '[REDACTED]',
        },
      };
    }
    if (error.cause instanceof ValidationError) {
      return {
        ...shape,
        message: error.message || shape.message,
        data: {
          ...shape.data,
          code: 'BAD_REQUEST',
          httpStatus: 400,
          stack: '[REDACTED]',
        },
      };
    }
    if (error.cause instanceof CreateResourceError) {
      return {
        ...shape,
        message: error.message || shape.message,
        data: {
          ...shape.data,
          code: 'BAD_REQUEST',
          httpStatus: 400,
          stack: '[REDACTED]',
        },
      };
    }

    const errorId = crypto.randomUUID();
    const shouldShowDetails = process.env.NODE_ENV == 'development' && false;
    const message = shouldShowDetails
      ? `Error ID: ${errorId}\n` + shape.message
      : 'Something went wrong: ID=' + errorId;
    console.error(`Error ID: ${errorId}`, error);

    return {
      ...shape,
      message,
      data: {
        ...shape.data,
        code: 'INTERNAL_SERVER_ERROR',
        httpStatus: 500,
        stack: '[REDACTED]',
        message,
      },
    };
  },
});

export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;

export { t };
