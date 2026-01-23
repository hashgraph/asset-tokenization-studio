// SPDX-License-Identifier: Apache-2.0

export const METAMASK_URL = "https://metamask.io/download/";

export enum WalletStatus {
  connected = "CONNECTED",
  connecting = "CONNECTING",
  disconnected = "DISCONNECTED",
  uninstalled = "UNINSTALLED",
}

export enum User {
  admin = "admin",
  holder = "holder",
  general = "general",
}

export const LOCALE = "en-US";
export const COUPONS_FACTOR = 1000;
export const NOMINAL_VALUE_DECIMALS = 2;

export const DATE_TIME_FORMAT = "dd/MM/yyyy HH:mm:ss";

// * Time periods (in seconds and milliseconds)
export const TIME_PERIODS_S = {
  SECOND: 1,
  MINUTE: 60,
  HOUR: 60 * 60,
  DAY: 24 * 60 * 60,
  WEEK: 7 * 24 * 60 * 60,
  MONTH: 30 * 24 * 60 * 60,
  QUARTER: 90 * 24 * 60 * 60,
  YEAR: 365 * 24 * 60 * 60,
};

export const TIME_PERIODS_MS = {
  SECOND: TIME_PERIODS_S.SECOND * 1000,
  MINUTE: TIME_PERIODS_S.MINUTE * 1000,
  HOUR: TIME_PERIODS_S.HOUR * 1000,
  DAY: TIME_PERIODS_S.DAY * 1000,
  WEEK: TIME_PERIODS_S.WEEK * 1000,
  MONTH: TIME_PERIODS_S.MONTH * 1000,
  QUARTER: TIME_PERIODS_S.QUARTER * 1000,
  YEAR: TIME_PERIODS_S.YEAR * 1000,
};

export const DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";

export const RATE_MAX_DECIMALS = 3;
