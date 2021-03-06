/* eslint-disable prefer-template */

import type {AxiosError} from 'axios';
import * as HTTP_STATUS from 'http-status-codes';

export class APIException extends Error {
  constructor(message = '', serverMessage?: string) {
    super(message);
    this.message += serverMessage ? `. ("${serverMessage}")` : '. The server did not provide any further information.';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthenticationError extends Error {
  constructor(message = '', serverMessage?: string) {
    super(message);
    this.message += '. Wrong API key?' + (serverMessage ? ` ("${serverMessage}")` : '');
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidResponseError extends Error {
  constructor(message = '') {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends Error {
  constructor(message = '', serverMessage?: string) {
    super(message);
    this.message += serverMessage ? `: "${serverMessage}".` : '. The server did not provide any further information.';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class RateLimitError extends Error {
  constructor(message = '', serverMessage?: string) {
    super(message);
    this.message += ': Rate limit hit.' + (serverMessage ? ` ("${serverMessage}")` : '');
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function ExceptionMapper(error: AxiosError): Error {
  if (error.response?.status) {
    const serverMessage = error.response.data?.message || undefined;

    switch (error.response.status) {
      case HTTP_STATUS.FORBIDDEN:
        return new AuthenticationError(error.message, serverMessage);
      case HTTP_STATUS.NOT_FOUND:
        return new NotFoundError(error.message, serverMessage);
      case HTTP_STATUS.TOO_MANY_REQUESTS:
        return new RateLimitError(error.message, serverMessage);
      default:
        return new APIException(error.message, serverMessage);
    }
  }

  if (error instanceof InvalidResponseError) {
    return error;
  }

  return new Error(error.message);
}
