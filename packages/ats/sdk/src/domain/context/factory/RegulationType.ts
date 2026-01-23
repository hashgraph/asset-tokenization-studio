// SPDX-License-Identifier: Apache-2.0

export enum RegulationType {
  NONE = "NONE",
  REG_S = "REG_S",
  REG_D = "REG_D",
}

export enum RegulationSubType {
  NONE = "NONE",
  B_506 = "506_B",
  C_506 = "506_C",
}

export enum AccreditedInvestors {
  NONE = "NONE",
  ACCREDITATION_REQUIRED = "ACCREDITATION REQUIRED",
}

export enum ManualInvestorVerification {
  NOTHING_TO_VERIFY = "NOTHING TO VERIFY",
  VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED = "VERIFICATION INVESTORS FINANCIAL DOCUMENTS REQUIRED",
}

export enum InternationalInvestors {
  NOT_ALLOWED = "NOT ALLOWED",
  ALLOWED = "ALLOWED",
}

export enum ResaleHoldPeriod {
  NOT_APPLICABLE = "NOT APPLICABLE",
  APPLICABLE_FROM_6_MOTHS_TO_1_YEAR = "APPLICABLE FROM 6 MOTHS TO 1 YEAR",
}

export class CastRegulationType {
  static fromNumber(id: number): RegulationType {
    if (id == 0) return RegulationType.NONE;
    if (id == 1) return RegulationType.REG_S;
    return RegulationType.REG_D;
  }

  static toNumber(value: RegulationType): number {
    if (value == RegulationType.NONE) return 0;
    if (value == RegulationType.REG_S) return 1;
    return 2;
  }
}

export class CastRegulationSubType {
  static fromNumber(id: number): RegulationSubType {
    if (id == 0) return RegulationSubType.NONE;
    if (id == 1) return RegulationSubType.B_506;
    return RegulationSubType.C_506;
  }

  static toNumber(value: RegulationSubType): number {
    if (value == RegulationSubType.NONE) return 0;
    if (value == RegulationSubType.B_506) return 1;
    return 2;
  }
}

export class CheckRegulations {
  static typeAndSubtype(type: number, subtype: number): boolean {
    if (type == CastRegulationType.toNumber(RegulationType.REG_S)) {
      return subtype == CastRegulationSubType.toNumber(RegulationSubType.NONE);
    } else if (type == CastRegulationType.toNumber(RegulationType.REG_D)) {
      return (
        subtype == CastRegulationSubType.toNumber(RegulationSubType.B_506) ||
        subtype == CastRegulationSubType.toNumber(RegulationSubType.C_506)
      );
    }
    return false;
  }
}

export class CastAccreditedInvestors {
  static fromNumber(id: number): AccreditedInvestors {
    if (id == 0) return AccreditedInvestors.NONE;
    return AccreditedInvestors.ACCREDITATION_REQUIRED;
  }

  static toNumber(value: AccreditedInvestors): number {
    if (value == AccreditedInvestors.NONE) return 0;
    return 1;
  }
}

export class CastManualInvestorVerification {
  static fromNumber(id: number): ManualInvestorVerification {
    if (id == 0) return ManualInvestorVerification.NOTHING_TO_VERIFY;
    return ManualInvestorVerification.VERIFICATION_INVESTORS_FINANCIAL_DOCUMENTS_REQUIRED;
  }

  static toNumber(value: ManualInvestorVerification): number {
    if (value == ManualInvestorVerification.NOTHING_TO_VERIFY) return 0;
    return 1;
  }
}

export class CastInternationalInvestorscation {
  static fromNumber(id: number): InternationalInvestors {
    if (id == 0) return InternationalInvestors.NOT_ALLOWED;
    return InternationalInvestors.ALLOWED;
  }

  static toNumber(value: InternationalInvestors): number {
    if (value == InternationalInvestors.NOT_ALLOWED) return 0;
    return 1;
  }
}

export class CastResaleHoldPeriodorscation {
  static fromNumber(id: number): ResaleHoldPeriod {
    if (id == 0) return ResaleHoldPeriod.NOT_APPLICABLE;
    return ResaleHoldPeriod.APPLICABLE_FROM_6_MOTHS_TO_1_YEAR;
  }

  static toNumber(value: ResaleHoldPeriod): number {
    if (value == ResaleHoldPeriod.NOT_APPLICABLE) return 0;
    return 1;
  }
}
