// SPDX-License-Identifier: Apache-2.0

import { BondDetails } from "../bond/BondDetails";
import { BondFixedRateDetails } from "../bond/BondFixedRateDetails";
import { BondKpiLinkedRateDetails } from "../bond/BondKpiLinkedRateDetails";
import { ImpactData } from "../bond/ImpactData";
import { InterestRate } from "../bond/InterestRate";
import EvmAddress from "../contract/EvmAddress";
import { CastDividendType } from "../equity/DividendType";
import { EquityDetails } from "../equity/EquityDetails";
import { BondDetailsData } from "../factory/BondDetailsData";
import { BondFixedRateDetailsData } from "../factory/BondFixedRateDetailsData";
import { BondKpiLinkedRateDetailsData } from "../factory/BondKpiLinkedRateDetailsData";
import { EquityDetailsData } from "../factory/EquityDetailsData";
import { FactoryRegulationData } from "../factory/FactorySecurityToken";
import { Rbac } from "../factory/Rbac";
import { CastRegulationSubType, CastRegulationType } from "../factory/RegulationType";
import { SecurityData } from "../factory/SecurityData";
import { Security } from "../security/Security";
import { SecurityRole } from "../security/SecurityRole";

export class SecurityDataBuilder {
  static buildSecurityData(
    securityInfo: Security,
    resolver: EvmAddress,
    configId: string,
    configVersion: number,
    externalPauses: EvmAddress[] = [],
    externalControlLists: EvmAddress[] = [],
    externalKycLists: EvmAddress[] = [],
    diamondOwnerAccount: EvmAddress,
    compliance: EvmAddress,
    identityRegistry: EvmAddress,
  ): SecurityData {
    const rbacAdmin: Rbac = {
      role: SecurityRole._DEFAULT_ADMIN_ROLE,
      members: [diamondOwnerAccount.toString()],
    };

    return {
      arePartitionsProtected: securityInfo.arePartitionsProtected,
      isMultiPartition: securityInfo.isMultiPartition,
      resolver: resolver.toString(),
      resolverProxyConfiguration: { key: configId, version: configVersion },
      rbacs: [rbacAdmin],
      isControllable: securityInfo.isControllable,
      isWhiteList: securityInfo.isWhiteList,
      erc20VotesActivated: securityInfo.erc20VotesActivated,
      maxSupply: securityInfo.maxSupply?.toString() || "0",
      erc20MetadataInfo: {
        name: securityInfo.name,
        symbol: securityInfo.symbol,
        isin: securityInfo.isin,
        decimals: securityInfo.decimals,
      },
      clearingActive: securityInfo.clearingActive,
      internalKycActivated: securityInfo.internalKycActivated,
      externalPauses: externalPauses.map((addr) => addr.toString()),
      externalControlLists: externalControlLists.map((addr) => addr.toString()),
      externalKycLists: externalKycLists.map((addr) => addr.toString()),
      compliance: compliance.toString(),
      identityRegistry: identityRegistry.toString(),
    };
  }

  static buildRegulationData(securityInfo: Security): FactoryRegulationData {
    return new FactoryRegulationData(
      CastRegulationType.toNumber(securityInfo.regulationType!),
      CastRegulationSubType.toNumber(securityInfo.regulationsubType!),
      {
        countriesControlListType: securityInfo.isCountryControlListWhiteList,
        listOfCountries: securityInfo.countries ?? "",
        info: securityInfo.info ?? "",
      },
    );
  }

  static buildEquityDetails(equityInfo: EquityDetails): EquityDetailsData {
    return {
      votingRight: equityInfo.votingRight,
      informationRight: equityInfo.informationRight,
      liquidationRight: equityInfo.liquidationRight,
      subscriptionRight: equityInfo.subscriptionRight,
      conversionRight: equityInfo.conversionRight,
      redemptionRight: equityInfo.redemptionRight,
      putRight: equityInfo.putRight,
      dividendRight: CastDividendType.toNumber(equityInfo.dividendRight),
      currency: equityInfo.currency,
      nominalValue: equityInfo.nominalValue.toString(),
      nominalValueDecimals: equityInfo.nominalValueDecimals,
    };
  }

  static buildBondDetails(bondInfo: BondDetails): BondDetailsData {
    return new BondDetailsData(
      bondInfo.currency,
      bondInfo.nominalValue.toString(),
      bondInfo.nominalValueDecimals,
      bondInfo.startingDate.toString(),
      bondInfo.maturityDate.toString(),
    );
  }

  static buildBondFixedRateDetails(bondInfo: BondFixedRateDetails): BondFixedRateDetailsData {
    return new BondFixedRateDetailsData(
      bondInfo.currency,
      bondInfo.nominalValue.toString(),
      bondInfo.nominalValueDecimals,
      bondInfo.startingDate.toString(),
      bondInfo.maturityDate.toString(),
      bondInfo.rate,
      bondInfo.rateDecimals,
    );
  }

  static buildBondKpiLinkedRateDetails(bondInfo: BondKpiLinkedRateDetails): BondKpiLinkedRateDetailsData {
    return new BondKpiLinkedRateDetailsData(
      bondInfo.currency,
      bondInfo.nominalValue.toString(),
      bondInfo.nominalValueDecimals,
      bondInfo.startingDate.toString(),
      bondInfo.maturityDate.toString(),
      this.buildInterestRateData(bondInfo.interestRate),
      this.buildImpactData(bondInfo.impactData),
    );
  }

  static buildInterestRateData(interestRate: InterestRate): InterestRate {
    return new InterestRate(
      interestRate.maxRate,
      interestRate.baseRate,
      interestRate.minRate,
      interestRate.startPeriod,
      interestRate.startRate,
      interestRate.missedPenalty,
      interestRate.reportPeriod,
      interestRate.rateDecimals,
    );
  }

  static buildImpactData(impactData: ImpactData): ImpactData {
    return new ImpactData(
      impactData.maxDeviationCap,
      impactData.baseLine,
      impactData.maxDeviationFloor,
      impactData.impactDataDecimals,
      impactData.adjustmentPrecision,
    );
  }
}
