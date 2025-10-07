export class ExpectedError extends Error {}

export class ServerError extends ExpectedError {}

export class ClientError extends ExpectedError {
  httpCode: number;
  constructor(message: string, httpCode: number = 400) {
    super(message);
    this.httpCode = httpCode;
  }
}

export class InvalidArgumentError extends ClientError {
  constructor(message: string, httpCode: number = 400) {
    super(message, httpCode);
  }
}

export class InvalidUserError extends InvalidArgumentError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnathorizedError extends ClientError {
  constructor(message: string) {
    super(message, 401);
  }
}
