// SPDX-License-Identifier: Apache-2.0

import { AssetNotFoundError } from "@domain/errors/asset.error";
import { BlockchainEventListenerConfigNotFoundError } from "@domain/errors/blockchain-event-error";
import { DistributionNotFoundError } from "@domain/errors/distribution.error";
import { ConflictError } from "@domain/errors/shared/conflict-error";
import { CustomError } from "@domain/errors/shared/custom.error";
import { DomainError } from "@domain/errors/shared/domain.error";
import { InvalidDataError } from "@domain/errors/shared/invalid-data.error";
import { TooManyRequestsError } from "@domain/errors/shared/too-many-requests.error";
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";

@Catch()
export class RestExceptionFilter implements ExceptionFilter<Error> {
  private readonly logger = new Logger(RestExceptionFilter.name);

  private static readonly GENERIC_MESSAGES: Partial<Record<HttpStatus, string>> = {
    [HttpStatus.BAD_REQUEST]: "Invalid request",
    [HttpStatus.NOT_FOUND]: "Resource not found",
    [HttpStatus.CONFLICT]: "The request conflicts with the current state of the resource",
    [HttpStatus.TOO_MANY_REQUESTS]: "Too many requests, try again later",
  };

  catch(error: Error, host: ArgumentsHost): any {
    this.logger.error(error.message, error.stack, error.name);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    if (error instanceof HttpException) {
      const status = error.getStatus();
      const original = error.getResponse();

      const payload =
        typeof original === "string"
          ? { statusCode: status, message: original }
          : Array.isArray((original as any)?.message)
            ? { statusCode: status, message: (original as any).message.join(", ") }
            : original;
      return response.status(status).json(payload);
    }

    // Domain errors can carry caller input, asset names or token addresses. Keep that detail in the
    // server log written above and send the client only a generic message for the status code.
    const rootError = CustomError.getRootError(error);
    const status = this.getHttpCodeFromError(error);
    response.status(status).json(this.toSafePayload(status, rootError));
  }

  private getHttpCodeFromError(error: Error): HttpStatus {
    const rootError = CustomError.getRootError(error);
    if (rootError instanceof DomainError) {
      return this.mapDomainErrorToHttpStatus(rootError);
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private mapDomainErrorToHttpStatus(error: DomainError): HttpStatus {
    switch (true) {
      case error instanceof InvalidDataError:
        return HttpStatus.BAD_REQUEST;
      case error instanceof ConflictError:
        return HttpStatus.CONFLICT;
      case error instanceof TooManyRequestsError:
        return HttpStatus.TOO_MANY_REQUESTS;
      case error instanceof AssetNotFoundError:
      case error instanceof DistributionNotFoundError:
      case error instanceof BlockchainEventListenerConfigNotFoundError:
        return HttpStatus.NOT_FOUND;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private toSafePayload(
    status: HttpStatus,
    rootError: Error,
  ): {
    statusCode: number;
    message: string;
    error?: string;
  } {
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
      };
    }

    return {
      statusCode: status,
      message: RestExceptionFilter.GENERIC_MESSAGES[status] ?? "Request failed",
      // The error class name (e.g. "AssetPausedError") lets API clients tell cases apart without
      // exposing any of the values in the original message.
      error: rootError.name,
    };
  }
}
