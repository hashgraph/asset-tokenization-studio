// SPDX-License-Identifier: Apache-2.0

import { AssetNotFoundError } from "@domain/errors/asset.error"
import { BlockchainEventListenerConfigNotFoundError } from "@domain/errors/blockchain-event-error"
import { DistributionNotFoundError } from "@domain/errors/distribution.error"
import { ConflictError } from "@domain/errors/shared/conflict-error"
import { CustomError } from "@domain/errors/shared/custom.error"
import { DomainError } from "@domain/errors/shared/domain.error"
import { InvalidDataError } from "@domain/errors/shared/invalid-data.error"
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common"

@Catch()
export class RestExceptionFilter implements ExceptionFilter<Error> {
  private readonly logger = new Logger(RestExceptionFilter.name)

  catch(error: Error, host: ArgumentsHost): any {
    this.logger.error(error.message, error.stack, error.name)
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    if (error instanceof HttpException) {
      const status = error.getStatus()
      const original = error.getResponse()

      const payload =
        typeof original === "string"
          ? { statusCode: status, message: original }
          : Array.isArray((original as any)?.message)
            ? { statusCode: status, message: (original as any).message.join(", ") }
            : original
      return response.status(status).json(payload)
    }

    const messageFromError = this.getHttpMessageFromError(error)
    const codeFromError = this.getHttpCodeFromError(error)
    const causeFromError = this.getHttpCauseFromError(error)

    const exception = new HttpException(messageFromError, codeFromError, { cause: causeFromError })
    const status = exception.getStatus()
    const safePayload = this.maskIfInternalError(exception)

    response.status(status).json(safePayload)
  }

  private getHttpMessageFromError(error: Error): string {
    if (error instanceof CustomError) {
      return error.toJson()
    } else {
      return new CustomError().toJson()
    }
  }

  private getHttpCauseFromError(error: Error): string {
    if (error instanceof CustomError) {
      return error.toJson().cause
    } else {
      return new CustomError().toJson().cause
    }
  }

  private getHttpCodeFromError(error: Error): HttpStatus {
    const rootError = CustomError.getRootError(error)
    if (rootError instanceof DomainError) {
      return this.mapDomainErrorToHttpStatus(rootError)
    }

    return HttpStatus.INTERNAL_SERVER_ERROR
  }

  private mapDomainErrorToHttpStatus(error: DomainError): HttpStatus {
    switch (true) {
      case error instanceof InvalidDataError:
        return HttpStatus.BAD_REQUEST
      case error instanceof ConflictError:
        return HttpStatus.CONFLICT
      case error instanceof AssetNotFoundError:
      case error instanceof DistributionNotFoundError:
      case error instanceof BlockchainEventListenerConfigNotFoundError:
        return HttpStatus.NOT_FOUND
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR
    }
  }

  private maskIfInternalError(exc: HttpException): {
    statusCode: number
    message: string
    cause?: unknown
  } {
    if (exc.getStatus() == HttpStatus.INTERNAL_SERVER_ERROR) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Internal server error",
      }
    }

    return {
      statusCode: exc.getStatus(),
      message: exc.message,
      cause: exc.cause,
    }
  }
}
