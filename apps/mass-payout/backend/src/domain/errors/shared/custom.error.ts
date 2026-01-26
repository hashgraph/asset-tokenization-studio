// SPDX-License-Identifier: Apache-2.0

export class CustomError extends Error {
  static readonly MAX_MESSAGE_LENGTH = 500
  protected static JSON_MESSAGE = "message"
  protected static JSON_CAUSE = "cause"
  private static readonly DEFAULT_MESSAGE = "Internal error"
  public originalError?: Error
  public cause: string

  public constructor(message: string = CustomError.DEFAULT_MESSAGE, originalError?: Error, cause?: string) {
    if (message.length > CustomError.MAX_MESSAGE_LENGTH) {
      message = `${message.substring(0, CustomError.MAX_MESSAGE_LENGTH)}... (omitted)`
    }
    super(message)
    this.stack = originalError ? `${this.stack}\n${originalError.stack}` : this.stack
    this.name = this.constructor.name
    this.originalError = originalError
    this.cause = cause
  }

  public static getRootError(error: Error): Error {
    if (!(error instanceof CustomError)) {
      return error
    }

    if (error.originalError) {
      return this.getRootError(error.originalError)
    }

    return error
  }

  public toJson(): any {
    const rootError = CustomError.getRootError(this)
    const cause = rootError instanceof CustomError ? rootError.cause : undefined

    return {
      [CustomError.JSON_MESSAGE]: this.message,
      [CustomError.JSON_CAUSE]: cause,
    }
  }
}
