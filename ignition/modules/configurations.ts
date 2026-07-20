// SPDX-License-Identifier: Apache-2.0

/** Production BLR configurations, one per token type. */

import {
  getBondConfiguration,
  getDepositTokenConfiguration,
  getEquityConfiguration,
  getFactoryConfiguration,
} from "../lib/builders";
import { PRODUCTION_MODE } from "../lib/shared";

export const EquityConfiguration = getEquityConfiguration(PRODUCTION_MODE);
export const BondConfiguration = getBondConfiguration(PRODUCTION_MODE);
export const DepositTokenConfiguration = getDepositTokenConfiguration(PRODUCTION_MODE);
export const FactoryConfiguration = getFactoryConfiguration(PRODUCTION_MODE);
