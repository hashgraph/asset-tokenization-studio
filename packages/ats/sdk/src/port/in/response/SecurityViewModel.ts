// SPDX-License-Identifier: Apache-2.0

import { QueryResponse } from "@core/query/QueryResponse";
import RegulationViewModel from "./RegulationViewModel";

export default interface SecurityViewModel extends QueryResponse {
  name?: string;
  symbol?: string;
  isin?: string;
  type?: string;
  decimals?: number;
  isWhiteList?: boolean;
  isControllable?: boolean;
  isMultiPartition?: boolean;
  totalSupply?: string;
  maxSupply?: string;
  diamondAddress?: string;
  evmDiamondAddress?: string;
  paused?: boolean;
  regulation?: RegulationViewModel;
  isCountryControlListWhiteList?: boolean;
  countries?: string;
  info?: string;
}
