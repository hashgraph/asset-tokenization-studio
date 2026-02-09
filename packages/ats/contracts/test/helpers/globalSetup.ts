// SPDX-License-Identifier: Apache-2.0

// Direct import to avoid barrel's typechain eager-loading in parallel workers
import { configureLogger, LogLevel } from "../../scripts/infrastructure/utils/logging";

export const mochaHooks = {
  beforeAll(): void {
    configureLogger({ level: LogLevel.SILENT });
  },
};
