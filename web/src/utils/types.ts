export type TimeUnit = "YEAR" | "MONTH" | "DAY";

export type Options<T = string, Y = string> = Array<{
  code: T;
  description: Y;
}>;
