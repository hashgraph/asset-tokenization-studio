// SPDX-License-Identifier: Apache-2.0

export class Time {
  public static delay(time: number, unit: "seconds" | "milliseconds" | "sec" | "ms"): Promise<boolean> {
    let delayInMilliseconds: number;
    if (unit === "seconds" || unit === "sec") {
      delayInMilliseconds = time * 1000;
    } else if (unit === "milliseconds" || unit === "ms") {
      delayInMilliseconds = time;
    }
    return new Promise<boolean>((resolve) => setTimeout(() => resolve(true), delayInMilliseconds));
  }
}
