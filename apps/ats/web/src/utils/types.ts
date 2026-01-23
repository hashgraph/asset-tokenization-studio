// SPDX-License-Identifier: Apache-2.0

export type TimeUnit = "YEAR" | "MONTH" | "DAY";

export type Options<T = string, Y = string> = Array<{
  code: T;
  description: Y;
}>;
