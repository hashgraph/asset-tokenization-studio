// SPDX-License-Identifier: Apache-2.0

import isAfter from "date-fns/isAfter";
import isBefore from "date-fns/isBefore";
import isToday from "date-fns/isToday";
import isEqual from "date-fns/isEqual";
import i18n from "../i18n";
import { formatDate, toDate, validateCouponPeriod } from "./format";

const t = (key: string, options?: Record<string, unknown>) => {
  return i18n.t(`rules:${key}`, options);
};

export const maxLength = (value: number) => ({
  value,
  message: t("maxlength", { value }),
});

export const required = {
  value: true,
  message: t("required"),
};

export const isEmail = {
  value: /\S+@\S+\.\S+/,
  message: t("email"),
};

export const min = (value: number) => ({
  value,
  message: t("greaterOrEqualThan", { min: value }),
});

export const greaterThanZero = (val: number) => val > 0 || t("greaterThan", { min: 0 });

export const greaterThan = (min: number) => (val: number) => val > min || t("greaterThan", { min });

export const greaterOrEqualThan = (min: number) => (val: number) => val >= min || t("greaterOrEqualThan", { min });

export const isAfterDate = (initialDate: Date, format?: string) => (val: string | Date) =>
  isAfter(toDate(val), initialDate) || t("dateAfter", { date: formatDate(initialDate, format ?? "dd-MM-yyyy") });

export const isAfterTodayOrEqualDate = () => (val: string | Date) =>
  isAfter(toDate(val), new Date()) ||
  isToday(toDate(val)) ||
  t("dateAfter", { date: formatDate(new Date(), "dd-MM-yyyy") });

export const isBetweenDates = (initialDate: Date, maxDate: Date) => (val: string | Date) =>
  (isAfter(toDate(val), initialDate) && isBefore(toDate(val), maxDate)) ||
  t("dateBetween", {
    min: formatDate(initialDate, "dd-MM-yyyy"),
    max: formatDate(maxDate, "dd-MM-yyyy"),
  });

export const isBetweenInclusiveDates = (initialDate: Date, maxDate: Date) => (val: string | Date) =>
  ((isAfter(toDate(val), initialDate) || isEqual(toDate(val), initialDate)) &&
    (isBefore(toDate(val), maxDate) || isEqual(toDate(val), maxDate))) ||
  t("dateBetween", {
    min: formatDate(initialDate, "dd-MM-yyyy"),
    max: formatDate(maxDate, "dd-MM-yyyy"),
  });

export const isPercentage = (val: number) => val <= 100 || t("invalidPercentage");

export const lowerOrEqualThan = (max: number) => (val: number) => val <= max || t("maxExceeded");

export const lowerThan = (max: number) => (val: number) => val < max || t("lowerThan", { max });

export const isISINValid = (val: string) => {
  if (val.length !== 12) {
    return t("isISINValid", { length: 12 });
  }

  const isinRegex = /^[A-Z]{2}[A-Z0-9]{10}$/;
  if (!isinRegex.test(val)) {
    return t("isISINValidFormat");
  }

  // Validate Luhn algorithm
  const digits = val
    .split("")
    .map((char) => (/[A-Z]/.test(char) ? char.charCodeAt(0) - 55 : parseInt(char, 10)))
    .join("");

  let sum = 0;
  let alternate = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }

  if (sum % 10 !== 0) {
    return t("isISINValidFormat");
  }

  return true;
};

export const isValidHederaId = (val: string) => {
  const maskRegex = /^[0-9]\.[0-9]\.[0-9]{1,7}$/;
  return maskRegex.test(val) || t("isValidHederaId");
};

export const isValidHex = (val: string) => {
  const hexRegex = /^0x[0-9a-fA-F]*$/;
  if (!hexRegex.test(val)) {
    return t("isValidHex");
  }

  const hexPart = val.slice(2);
  if (hexPart.length % 2 !== 0) {
    return t("isValidHex");
  }

  return true;
};

export const isValidCouponPeriod = (val: string) => {
  try {
    // Period is required - cannot be empty or null
    if (!val || val.trim() === "") {
      return "Coupon period is required";
    }

    const periodValue = parseInt(val);
    if (isNaN(periodValue) || periodValue <= 0) {
      return "Coupon period must be a valid positive number";
    }

    const validation = validateCouponPeriod(periodValue);
    return validation === true || validation;
  } catch (error) {
    return "Invalid coupon period";
  }
};
