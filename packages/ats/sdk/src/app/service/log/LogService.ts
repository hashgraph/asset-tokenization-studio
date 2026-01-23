// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createLogger, LoggerOptions, transports, format } from "winston";
import safeStringify from "fast-safe-stringify";
import BaseError from "@core/error/BaseError";

const { Console } = transports;
const { printf } = format;

export enum LogLevel {
  TRACE = "TRACE",
  INFO = "INFO",
  ERROR = "ERROR",
}

export const LoggerOptionLevels = {
  [LogLevel.TRACE]: 3,
  [LogLevel.INFO]: 2,
  [LogLevel.ERROR]: 0,
};

export default class LogService {
  public static instance: LogService = new LogService();
  public static defaultFormat = printf(({ level, message, timestamp, other }) => {
    const formatOther = (val: any[]): string => {
      return val
        .map((e) => {
          switch (typeof e) {
            case "object":
              return safeStringify(e);
            default:
              return e;
          }
        })
        .join("\t");
    };
    return `${timestamp} - [${level}]\t${message}\t${formatOther(other as any[])}`;
  });

  private logger;
  private readonly coreConfig: LoggerOptions = {
    levels: LoggerOptionLevels,
    exitOnError: false,
  };
  private readonly defaultConfig: LoggerOptions = {
    transports: new Console(),
    level: LogLevel.ERROR,
    format: LogService.defaultFormat,
  };

  constructor(opts?: LoggerOptions) {
    LogService.instance = this;
    this.logger = createLogger({
      ...(opts ? { ...this.defaultConfig, ...opts } : this.defaultConfig),
      ...this.coreConfig,
    });
  }

  public static log(level: LogLevel, message: any, params: any[]): void {
    this.instance.logger.log(level, message, {
      timestamp: new Date().toISOString(),
      other: params,
    });
  }

  public static logError(error: unknown | BaseError, ...params: any[]): void {
    if (error instanceof BaseError) {
      this.log(
        LogLevel.ERROR,
        error
          .toString
          //Injectable.resolve<typeof SDK>('SDK').log.level === 'TRACE',
          (),
        params,
      );
    } else {
      this.log(LogLevel.ERROR, error, params);
    }
  }

  public static logInfo(message: any, ...params: any[]): void {
    this.log(LogLevel.INFO, message, params);
  }

  public static logTrace(message: any, ...params: any[]): void {
    this.log(LogLevel.TRACE, message, params);
  }
}
