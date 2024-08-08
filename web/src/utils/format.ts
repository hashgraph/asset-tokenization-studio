import _capitalize from "lodash/capitalize";
import _formatDate from "date-fns/format";
import { TimeUnit } from "./types";
import i18n from "../i18n";
import { LOCALE } from "./constants";

export const formatAddressAccount = (address: string) => `${_capitalize(
  address.slice(0, 2),
)}
...${_capitalize(address.slice(-4))}`;

export const formatCurrency = (
  amount: number,
  {
    currency = "EUR",
    locale = LOCALE,
    options,
  }: {
    currency?: string;
    locale?: string;
    options?: Intl.NumberFormatOptions;
  } = {},
) => {
  return (amount ?? 0).toLocaleString(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
    useGrouping: true,
    ...options,
  });
};

export const toList = <T>(data: T | T[]): T[] => {
  return Array.isArray(data) ? data : [data];
};

export const toDate = (date: string | Date = new Date()) =>
  date instanceof Date ? date : new Date(date);

export const formatDate = (
  date?: string | Date,
  format = "dd/MM/yyyy",
  defaultValue = "",
) => {
  if (!date) return defaultValue;
  return _formatDate(toDate(date), format);
};

export const collapseText = (text: string, startLength = 4, endLength = 3) => {
  if (startLength + endLength >= text.length) return text;

  const start = text.substring(0, startLength);
  const end = text.substring(text.length - endLength);
  return `${start}...${end}`;
};

export const formatPercent = (value?: string | number, defaultValue = 0) => {
  if (!value) value = defaultValue;

  // TODO: number.toLocaleString
  return `${value}%`;
};

export const formatFrequency = ({
  amount,
  timeUnit,
}: {
  amount: number;
  timeUnit: TimeUnit;
}) => {
  const unit = i18n.t(`timeUnit.${timeUnit}`, { count: amount });
  return `${i18n.t("every")} ${amount} ${unit}`;
};

export const formatPeriod = ({
  amount,
  timeUnit,
}: {
  amount: number;
  timeUnit: TimeUnit;
}) => {
  const unit = i18n.t(`timeUnit.${timeUnit}`, { count: amount });
  return `${amount} ${unit}`;
};

//TODO: remove?
export const formatNumber = (
  value: number | string | null,
  options: Intl.NumberFormatOptions = {},
  decimals = 3,
) =>
  (+(value || 0)).toLocaleString(i18n.language, {
    style: "decimal",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    ...options,
  });

export const toNumber = (value?: string, decimals: number = 0) => {
  if (!value) return 0;
  return +value / 10 ** decimals;
};

export const formatNumberLocale = (value?: string | number, decimals = 0) => {
  if (value === undefined) return "";
  const valueNumber =
    typeof value === "string" ? toNumber(value, decimals) : value;
  return valueNumber.toLocaleString(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const textToHex = (text: string) => {
  let ascii = "0x";

  for (let index = 0; index < text.length; index++) {
    ascii = ascii + text.charCodeAt(index).toString(16);
  }

  return ascii;
};

export const hexToText = (hexString: string) => {
  let asciiString = "";

  for (let i = 0; i < hexString.length; i += 2) {
    const hexChar = hexString.substring(i, i + 2);
    const asciiCode = parseInt(hexChar, 16);

    asciiString += String.fromCharCode(asciiCode);
  }

  return asciiString;
};

export const numberToExponential = (number: string, decimals: number) => {
  return (+number * Math.pow(10, decimals)).toString();
};

export const dateToUnixTimestamp = (date: string) => {
  return (new Date(date).getTime() / 1000).toString();
};

export const calculateCouponFrequency = (couponFrequency: string) => {
  return (parseInt(couponFrequency) * (30 * 24 * 60 * 60)).toString();
};
