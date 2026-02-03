// SPDX-License-Identifier: Apache-2.0

import BaseError from "../error/BaseError";
import { BaseArgs } from "./BaseArgs";

export type ValidatedArgsKey<T extends BaseArgs> = keyof Omit<T, "validations" | "validate">;

export type ValidationFn<K> = (val: K) => BaseError[] | void;
export type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];

export type ValidationSchema<T extends BaseArgs> = Partial<{
  [K in ValidatedArgsKey<T>]: ValidationFn<PropType<T, K>>;
}>;
