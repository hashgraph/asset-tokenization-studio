// SPDX-License-Identifier: Apache-2.0

import { InvalidRequest } from "@command/error/InvalidRequest";
import BaseError from "@core/error/BaseError";
import ValidatedDomain from "@core/validation/ValidatedArgs";

interface TrexTokenDetailsAtsProps {
  owner: string;
  irs: string;
  onchainId: string;
  irAgents: string[];
  tokenAgents: string[];
  compliancesModules: string[];
  complianceSettings: string[];
}

interface TrexClaimDetailsProps {
  claimTopics?: number[];
  issuers: string[];
  issuerClaims: number[][];
}

export class TrexTokenDetailsAts extends ValidatedDomain<TrexTokenDetailsAts> implements TrexTokenDetailsAtsProps {
  public owner: string;
  public irs: string;
  public onchainId: string;
  public irAgents: string[];
  public tokenAgents: string[];
  public compliancesModules: string[];
  public complianceSettings: string[];

  constructor(params: TrexTokenDetailsAtsProps) {
    super({
      irAgents: (val) => {
        return TrexTokenDetailsAts.checkMaxAgents(val, params.tokenAgents);
      },
      tokenAgents: (val) => {
        return TrexTokenDetailsAts.checkMaxAgents(params.irAgents, val);
      },
      compliancesModules: (val) => {
        return TrexTokenDetailsAts.checkComplianceModules(val, params.complianceSettings);
      },
      complianceSettings: (val) => {
        return TrexTokenDetailsAts.checkComplianceModules(params.compliancesModules, val);
      },
    });

    const {
      owner,
      irs,
      onchainId,
      irAgents = [],
      tokenAgents = [],
      compliancesModules = [],
      complianceSettings = [],
    } = params;

    this.owner = owner;
    this.irs = irs;
    this.onchainId = onchainId;
    this.irAgents = irAgents;
    this.tokenAgents = tokenAgents;
    this.compliancesModules = compliancesModules;
    this.complianceSettings = complianceSettings;

    ValidatedDomain.handleValidation(TrexTokenDetailsAts.name, this);
  }

  public static checkMaxAgents(irAgents: string[], tokenAgents: string[]): BaseError[] {
    const errorList: BaseError[] = [];

    if (irAgents.length > 5 || tokenAgents.length > 5) {
      errorList.push(new InvalidRequest("max 5 agents at deployment"));
    }

    return errorList;
  }

  public static checkComplianceModules(compliancesModules: string[], complianceSettings: string[]): BaseError[] {
    const errorList: BaseError[] = [];

    if (compliancesModules.length > 30) {
      errorList.push(new InvalidRequest("max 30 module actions at deployment"));
    }

    if (compliancesModules.length < complianceSettings.length) {
      errorList.push(new InvalidRequest("invalid compliance pattern"));
    }

    return errorList;
  }
}

export class TrexClaimDetails extends ValidatedDomain<TrexClaimDetails> implements TrexClaimDetailsProps {
  claimTopics: number[];
  issuers: string[];
  issuerClaims: number[][];

  constructor(params: TrexClaimDetailsProps) {
    super({
      claimTopics: (val) => {
        return TrexClaimDetails.checkClaimTopics(val);
      },
      issuers: (val) => {
        return TrexClaimDetails.checkIssuers(val, params.issuerClaims);
      },
    });

    const { claimTopics = [], issuers = [], issuerClaims = [] } = params;

    this.claimTopics = claimTopics;
    this.issuers = issuers;
    this.issuerClaims = issuerClaims;

    ValidatedDomain.handleValidation(TrexClaimDetails.name, this);
  }

  public static checkClaimTopics(value: number[]): BaseError[] {
    const errorList: BaseError[] = [];

    if (value.length > 5) {
      errorList.push(new InvalidRequest("max 5 claim topics at deployment"));
    }
    return errorList;
  }

  public static checkIssuers(issuers: string[], issuerClaims: number[][]): BaseError[] {
    const errorList: BaseError[] = [];

    if (issuers.length > 5) {
      errorList.push(new InvalidRequest("max 5 claim issuers at deployment"));
    }

    if (issuers.length !== issuerClaims.length) {
      errorList.push(new InvalidRequest("claim pattern not valid"));
    }
    return errorList;
  }
}
