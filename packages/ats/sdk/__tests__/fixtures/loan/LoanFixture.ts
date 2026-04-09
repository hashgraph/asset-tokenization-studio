// SPDX-License-Identifier: Apache-2.0

import { CreateLoanCommand } from "@command/loan/create/CreateLoanCommand";
import { SetLoanDetailsCommand } from "@command/loan/setDetails/SetLoanDetailsCommand";
import { LoanDetails } from "@domain/context/loan/LoanDetails";
import ContractId from "@domain/context/contract/ContractId";
import {
  CastRegulationSubType,
  CastRegulationType,
  RegulationSubType,
  RegulationType,
} from "@domain/context/factory/RegulationType";
import { faker } from "@faker-js/faker/.";
import CreateLoanRequest from "@port/in/request/loan/CreateLoanRequest";
import GetLoanDetailsRequest from "@port/in/request/loan/GetLoanDetailsRequest";
import SetLoanDetailsRequest from "@port/in/request/loan/SetLoanDetailsRequest";
import { GetLoanDetailsQuery } from "@query/loan/get/getLoanDetails/GetLoanDetailsQuery";
import { HederaId } from "@domain/context/shared/HederaId";
import { createFixture } from "../config";
import { ContractIdPropFixture, HederaIdPropsFixture } from "../shared/DataFixture";
import { SecurityPropsFixture } from "../shared/SecurityFixture";

export const LoanDetailsFixture = createFixture<LoanDetails>((props) => {
  props.currency.faker((faker) => `0x${Buffer.from(faker.finance.currencyCode()).toString("hex")}`);
  props.startingDate.faker((faker) => faker.date.past().getTime());
  props.maturityDate.faker((faker) => faker.date.recent().getTime());
  props.loanStructureType.faker((faker) => faker.number.int({ min: 0, max: 1 }));
  props.repaymentType.faker((faker) => faker.number.int({ min: 0, max: 1 }));
  props.interestType.as(() => 0);
  props.signingDate.faker((faker) => faker.date.past().getTime());
  props.originatorAccount.as(() => HederaIdPropsFixture.create().value);
  props.servicerAccount.as(() => HederaIdPropsFixture.create().value);
  props.baseReferenceRate.faker((faker) => faker.number.int({ min: 0, max: 2 }));
  props.floorRate.faker((faker) => faker.number.int({ min: 0, max: 500 }));
  props.capRate.faker((faker) => faker.number.int({ min: 0, max: 1000 }));
  props.rateMargin.faker((faker) => faker.number.int({ min: 0, max: 300 }));
  props.dayCount.as(() => 0);
  props.paymentFrequency.faker((faker) => faker.number.int({ min: 0, max: 2 }));
  props.firstAccrualDate.faker((faker) => faker.date.past().getTime());
  props.prepaymentPenalty.faker((faker) => faker.number.int({ min: 0, max: 100 }));
  props.commitmentFee.faker((faker) => faker.number.int({ min: 0, max: 50 }));
  props.utilizationFee.faker((faker) => faker.number.int({ min: 0, max: 50 }));
  props.utilizationFeeType.faker((faker) => faker.number.int({ min: 0, max: 1 }));
  props.servicingFee.faker((faker) => faker.number.int({ min: 0, max: 50 }));
  props.internalRiskGrade.faker((faker) => faker.string.alpha({ length: 3, casing: "upper" }));
  props.defaultProbability.faker((faker) => faker.number.int({ min: 0, max: 1000 }));
  props.lossGivenDefault.faker((faker) => faker.number.int({ min: 0, max: 10000 }));
  props.totalCollateralValue.faker((faker) => faker.number.int({ min: 0, max: 5000000 }));
  props.loanToValue.faker((faker) => faker.number.int({ min: 0, max: 100 }));
  props.performanceStatus.faker((faker) => faker.number.int({ min: 0, max: 2 }));
  props.daysPastDue.faker((faker) => faker.number.int({ min: 0, max: 365 }));
});

export const CreateLoanCommandFixture = createFixture<CreateLoanCommand>((command) => {
  command.security.fromFixture(SecurityPropsFixture);
  command.factory?.as(() => new ContractId(ContractIdPropFixture.create().value));
  command.resolver?.as(() => new ContractId(ContractIdPropFixture.create().value));
  command.configId?.as(() => HederaIdPropsFixture.create().value);
  command.configVersion?.faker((faker) => faker.number.int({ min: 1, max: 5 }));
  command.diamondOwnerAccount?.as(() => HederaIdPropsFixture.create().value);
  command.currency.faker((faker) => `0x${Buffer.from(faker.finance.currencyCode()).toString("hex")}`);
  command.nominalValue.faker((faker) => faker.finance.amount({ min: 1, max: 10, dec: 2 }));
  command.nominalValueDecimals.faker((faker) => faker.number.int({ min: 1, max: 5 }));
  command.startingDate.faker((faker) => faker.date.recent().getTime().toString());
  command.maturityDate.faker((faker) => faker.date.future({ years: 2 }).getTime().toString());
  command.loanStructureType.faker((faker) => faker.number.int({ min: 0, max: 1 }));
  command.repaymentType.faker((faker) => faker.number.int({ min: 0, max: 1 }));
  command.interestType.as(() => 0);
  command.originatorAccount.as(() => HederaIdPropsFixture.create().value);
  command.servicerAccount.as(() => HederaIdPropsFixture.create().value);
  command.signingDate.faker((faker) => faker.date.recent().getTime().toString());
  command.baseReferenceRate.faker((faker) => faker.number.int({ min: 0, max: 2 }));
  command.floorRate.faker((faker) => faker.number.int({ min: 0, max: 500 }).toString());
  command.capRate.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
  command.rateMargin.faker((faker) => faker.number.int({ min: 0, max: 300 }).toString());
  command.dayCount.as(() => 0);
  command.paymentFrequency.faker((faker) => faker.number.int({ min: 0, max: 2 }));
  command.firstAccrualDate.faker((faker) => faker.date.recent().getTime().toString());
  command.prepaymentPenalty.faker((faker) => faker.number.int({ min: 0, max: 100 }).toString());
  command.commitmentFee.faker((faker) => faker.number.int({ min: 0, max: 50 }).toString());
  command.utilizationFee.faker((faker) => faker.number.int({ min: 0, max: 50 }).toString());
  command.utilizationFeeType.faker((faker) => faker.number.int({ min: 0, max: 1 }));
  command.servicingFee.faker((faker) => faker.number.int({ min: 0, max: 50 }).toString());
  command.internalRiskGrade.faker((faker) => faker.string.alpha({ length: 3, casing: "upper" }));
  command.defaultProbability.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
  command.lossGivenDefault.faker((faker) => faker.number.int({ min: 0, max: 10000 }).toString());
  command.totalCollateralValue.faker((faker) => faker.number.int({ min: 0, max: 5000000 }).toString());
  command.loanToValue.faker((faker) => faker.number.int({ min: 0, max: 100 }).toString());
  command.performanceStatus.faker((faker) => faker.number.int({ min: 0, max: 2 }));
  command.daysPastDue.faker((faker) => faker.number.int({ min: 0, max: 365 }).toString());
  command.externalControlListsIds?.as(() => [HederaIdPropsFixture.create().value]);
  command.externalKycListsIds?.as(() => [HederaIdPropsFixture.create().value]);
  command.complianceId?.as(() => HederaIdPropsFixture.create().value);
  command.identityRegistryId?.as(() => HederaIdPropsFixture.create().value);
});

export const CreateLoanRequestFixture = createFixture<CreateLoanRequest>((request) => {
  request.name.faker((faker) => faker.company.name());
  request.symbol.faker((faker) => faker.string.alpha({ length: 3, casing: "upper" }));
  request.isin.faker((faker) => `US${faker.string.numeric(9)}`);
  request.decimals.faker((faker) => faker.number.int({ min: 0, max: 18 }));
  request.isWhiteList.faker((faker) => faker.datatype.boolean());
  request.isControllable.faker((faker) => faker.datatype.boolean());
  request.arePartitionsProtected.faker((faker) => faker.datatype.boolean());
  request.clearingActive.faker((faker) => faker.datatype.boolean());
  request.internalKycActivated.faker((faker) => faker.datatype.boolean());
  request.isMultiPartition.faker((faker) => faker.datatype.boolean());
  request.numberOfUnits?.as(() => "0");
  const regulationType = CastRegulationType.toNumber(
    faker.helpers.arrayElement(Object.values(RegulationType).filter((type) => type !== RegulationType.NONE)),
  );
  request.regulationType?.as(() => regulationType);
  request.regulationSubType?.faker((faker) =>
    regulationType === CastRegulationType.toNumber(RegulationType.REG_S)
      ? CastRegulationSubType.toNumber(RegulationSubType.NONE)
      : CastRegulationSubType.toNumber(
          faker.helpers.arrayElement(
            Object.values(RegulationSubType).filter((subType) => subType !== RegulationSubType.NONE),
          ),
        ),
  );
  request.isCountryControlListWhiteList.faker((faker) => faker.datatype.boolean());
  request.countries?.faker((faker) =>
    faker.helpers
      .arrayElements(
        Array.from({ length: 5 }, () => faker.location.countryCode({ variant: "alpha-2" })),
        { min: 1, max: 5 },
      )
      .join(","),
  );
  request.info.faker((faker) => faker.lorem.words());
  request.configId.faker(
    (faker) =>
      `0x000000000000000000000000000000000000000000000000000000000000000${faker.number.int({ min: 1, max: 9 })}`,
  );
  request.configVersion.as(() => 1);
  request.diamondOwnerAccount?.as(() => HederaIdPropsFixture.create().value);
  request.externalPausesIds?.as(() => [HederaIdPropsFixture.create().value]);
  request.externalControlListsIds?.as(() => [HederaIdPropsFixture.create().value]);
  request.externalKycListsIds?.as(() => [HederaIdPropsFixture.create().value]);
  request.complianceId?.as(() => HederaIdPropsFixture.create().value);
  request.identityRegistryId?.as(() => HederaIdPropsFixture.create().value);
  request.currency.faker((faker) => `0x${Buffer.from(faker.finance.currencyCode()).toString("hex")}`);
  request.nominalValue.faker((faker) => faker.finance.amount({ min: 1, max: 10, dec: 2 }));
  request.nominalValueDecimals.faker((faker) => faker.number.int({ min: 1, max: 5 }));
  request.startingDate.faker((faker) => faker.date.recent().getTime().toString());
  request.maturityDate.faker((faker) => faker.date.future({ years: 2 }).getTime().toString());
  request.loanStructureType.faker((faker) => faker.number.int({ min: 0, max: 1 }));
  request.repaymentType.faker((faker) => faker.number.int({ min: 0, max: 1 }));
  request.interestType.as(() => 0);
  request.signingDate?.faker((faker) => faker.date.recent().getTime().toString());
  request.originatorAccount.as(() => HederaIdPropsFixture.create().value);
  request.servicerAccount.as(() => HederaIdPropsFixture.create().value);
});

export const GetLoanDetailsRequestFixture = createFixture<GetLoanDetailsRequest>((request) => {
  request.loanId.as(() => HederaIdPropsFixture.create().value);
});

export const GetLoanDetailsQueryFixture = createFixture<GetLoanDetailsQuery>((query) => {
  query.loanId.as(() => new HederaId(HederaIdPropsFixture.create().value));
});

export const SetLoanDetailsCommandFixture = createFixture<SetLoanDetailsCommand>((command) => {
  command.loanId.as(() => HederaIdPropsFixture.create().value);
  command.currency.faker((faker) => `0x${Buffer.from(faker.finance.currencyCode()).toString("hex")}`);
  command.startingDate.faker((faker) => faker.date.recent().getTime().toString());
  command.maturityDate.faker((faker) => faker.date.future({ years: 2 }).getTime().toString());
  command.loanStructureType.faker((faker) => faker.number.int({ min: 0, max: 1 }));
  command.repaymentType.faker((faker) => faker.number.int({ min: 0, max: 1 }));
  command.interestType.as(() => 0);
  command.signingDate.faker((faker) => faker.date.recent().getTime().toString());
  command.originatorAccount.as(() => HederaIdPropsFixture.create().value);
  command.servicerAccount.as(() => HederaIdPropsFixture.create().value);
  command.baseReferenceRate.faker((faker) => faker.number.int({ min: 0, max: 2 }));
  command.floorRate.faker((faker) => faker.number.int({ min: 0, max: 500 }).toString());
  command.capRate.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
  command.rateMargin.faker((faker) => faker.number.int({ min: 0, max: 300 }).toString());
  command.dayCount.as(() => 0);
  command.paymentFrequency.faker((faker) => faker.number.int({ min: 0, max: 2 }));
  command.firstAccrualDate.faker((faker) => faker.date.recent().getTime().toString());
  command.prepaymentPenalty.faker((faker) => faker.number.int({ min: 0, max: 100 }).toString());
  command.commitmentFee.faker((faker) => faker.number.int({ min: 0, max: 50 }).toString());
  command.utilizationFee.faker((faker) => faker.number.int({ min: 0, max: 50 }).toString());
  command.utilizationFeeType.faker((faker) => faker.number.int({ min: 0, max: 1 }));
  command.servicingFee.faker((faker) => faker.number.int({ min: 0, max: 50 }).toString());
  command.internalRiskGrade.faker((faker) => faker.string.alpha({ length: 3, casing: "upper" }));
  command.defaultProbability.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
  command.lossGivenDefault.faker((faker) => faker.number.int({ min: 0, max: 10000 }).toString());
  command.totalCollateralValue.faker((faker) => faker.number.int({ min: 0, max: 5000000 }).toString());
  command.loanToValue.faker((faker) => faker.number.int({ min: 0, max: 100 }).toString());
  command.performanceStatus.faker((faker) => faker.number.int({ min: 0, max: 2 }));
  command.daysPastDue.faker((faker) => faker.number.int({ min: 0, max: 365 }).toString());
});
