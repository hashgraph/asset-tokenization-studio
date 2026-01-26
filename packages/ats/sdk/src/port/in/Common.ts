// SPDX-License-Identifier: Apache-2.0

import { transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import TransportStream from "winston-transport";
import LogService from "@service/log/LogService";

// App Metadata
export type AppMetadata = {
  icon: string;
  name: string;
  description: string;
  url: string;
  debugMode?: boolean;
};

export type LogOptions = {
  level: "TRACE" | "INFO" | "ERROR" | string;
  transports: TransportStream | TransportStream[];
};

// const DefaultLoggerFormat = LogService.defaultFormat;

// Log transports
export { transports as LoggerTransports };
export { DailyRotateFile };
// export { DefaultLoggerFormat };

class SDK {
  private static _log: LogOptions;
  public static get log(): LogOptions {
    return SDK._log;
  }
  public static set log(value: LogOptions) {
    SDK._log = value;
    new LogService(value);
  }

  private static _appMetadata: AppMetadata;
  public static get appMetadata(): AppMetadata {
    return SDK._appMetadata;
  }
  public static set appMetadata(value: AppMetadata) {
    SDK._appMetadata = value;
  }
}
export { SDK };
