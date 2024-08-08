import isAfter from "date-fns/isAfter";
import isBefore from "date-fns/isBefore";
import isToday from "date-fns/isToday";
import i18n from "../i18n";
import { formatDate, toDate } from "./format";

const t = (key: string, options?: object) => {
  return i18n.t(`rules:${key}`, options || {});
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

export const greaterThanZero = (val: number) =>
  val > 0 || t("greaterThan", { min: 0 });

export const greaterThan = (min: number) => (val: number) =>
  val > min || t("greaterThan", { min });

export const greaterOrEqualThan = (min: number) => (val: number) =>
  val >= min || t("greaterOrEqualThan", { min });

export const isAfterDate = (initialDate: Date) => (val: string | Date) =>
  isAfter(toDate(val), initialDate) ||
  t("dateAfter", { date: formatDate(initialDate, "dd-MM-yyyy") });

export const isAfterTodayOrEqualDate = () => (val: string | Date) =>
  isAfter(toDate(val), new Date()) ||
  isToday(toDate(val)) ||
  t("dateAfter", { date: formatDate(new Date(), "dd-MM-yyyy") });

export const isBetweenDates =
  (initialDate: Date, maxDate: Date) => (val: string | Date) =>
    (isAfter(toDate(val), initialDate) && isBefore(toDate(val), maxDate)) ||
    t("dateBetween", {
      min: formatDate(initialDate, "dd-MM-yyyy"),
      max: formatDate(maxDate, "dd-MM-yyyy"),
    });

export const isPercentage = (val: number) =>
  val <= 100 || t("invalidPercentage");

export const lowerOrEqualThan = (max: number) => (val: number) =>
  val <= max || t("maxExceeded");

export const lowerThan = (max: number) => (val: number) =>
  val < max || t("lowerThan", { max });

export const isISINValid = (length: number) => (val: string) =>
  val.length === length || t("isISINValid", { length });

export const isHederaValidAddress = (val: string) => {
  const maskRegex = /^[0-9]\.[0-9]\.[0-9]{1,7}$/;
  return maskRegex.test(val) || t("isHederaValidAddress");
};
