// SPDX-License-Identifier: Apache-2.0

import { SecurityProps } from "@domain/context/security/Security";
import { CastRegulationSubType, CastRegulationType } from "@domain/context/factory/RegulationType";
import BigDecimal from "@domain/context/shared/BigDecimal";

export function toSecurityProps(req: {
  name: string;
  symbol: string;
  isin: string;
  decimals: number;
  isWhiteList: boolean;
  erc20VotesActivated: boolean;
  isControllable: boolean;
  arePartitionsProtected: boolean;
  clearingActive: boolean;
  internalKycActivated: boolean;
  isMultiPartition: boolean;
  numberOfUnits: string;
  regulationType: number;
  regulationSubType: number;
  isCountryControlListWhiteList: boolean;
  countries: string;
  info: string;
}): SecurityProps {
  return {
    name: req.name,
    symbol: req.symbol,
    isin: req.isin,
    decimals: req.decimals,
    isWhiteList: req.isWhiteList,
    erc20VotesActivated: req.erc20VotesActivated,
    isControllable: req.isControllable,
    arePartitionsProtected: req.arePartitionsProtected,
    clearingActive: req.clearingActive,
    internalKycActivated: req.internalKycActivated,
    isMultiPartition: req.isMultiPartition,
    maxSupply: BigDecimal.fromString(req.numberOfUnits),
    regulationType: CastRegulationType.fromNumber(req.regulationType),
    regulationsubType: CastRegulationSubType.fromNumber(req.regulationSubType),
    isCountryControlListWhiteList: req.isCountryControlListWhiteList,
    countries: req.countries,
    info: req.info,
  };
}
