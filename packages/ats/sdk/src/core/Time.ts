// SPDX-License-Identifier: Apache-2.0

import { InvalidTimeUnits } from "./error/InvalidTimeUnits";

export class Time {
  public static delay(time: number, unit: "seconds" | "milliseconds" | "sec" | "ms"): Promise<boolean> {
    let delayInMilliseconds: number;
    if (unit === "seconds" || unit === "sec") {
      delayInMilliseconds = time * 1000;
    } else if (unit === "milliseconds" || unit === "ms") {
      delayInMilliseconds = time;
    } else {
      throw new InvalidTimeUnits();
    }
    return new Promise<boolean>((resolve) => setTimeout(() => resolve(true), delayInMilliseconds));
  }
}
