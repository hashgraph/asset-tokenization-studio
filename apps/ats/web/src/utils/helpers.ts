// SPDX-License-Identifier: Apache-2.0

import isBefore from "date-fns/isBefore";
import { toDate } from "./format";
import { SecurityRole } from "./SecurityRole";

export const checkIsApprovalError = (error: unknown) => {
  if (typeof error !== "object" || error === null) return false;

  // @ts-ignore
  return error?.message?.includes("is not in white list");
};

export const checkIsBlockedError = (error: unknown) => {
  if (typeof error !== "object" || error === null) return false;

  // @ts-ignore
  return error?.message?.includes("is in black list");
};

export enum KnownErrors {
  blocked = "blocked",
  not_approved = "not_approved",
  unknown = "unknown",
}

export const checkError = (error: unknown) => {
  const isApprovalError = checkIsApprovalError(error);
  if (isApprovalError) return KnownErrors.not_approved;

  const isBlockedError = checkIsBlockedError(error);
  if (isBlockedError) return KnownErrors.blocked;

  return KnownErrors.unknown;
};

export const isBeforeDate = (maxDate: Date) => (val: string | Date) => {
  return isBefore(toDate(val), toDate(maxDate));
};

export const hasRole = (roles: string[], role: SecurityRole) => roles.includes(role);
