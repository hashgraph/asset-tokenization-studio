// SPDX-License-Identifier: Apache-2.0

import { SetCouponCommand } from "@command/bond/coupon/set/SetCouponCommand";
import { CreateBondCommand } from "@command/bond/create/CreateBondCommand";
import { CreateTrexSuiteBondCommand } from "@command/bond/createTrexSuite/CreateTrexSuiteBondCommand";
import { FullRedeemAtMaturityCommand } from "@command/bond/fullRedeemAtMaturity/FullRedeemAtMaturityCommand";
import { RedeemAtMaturityByPartitionCommand } from "@command/bond/redeemAtMaturityByPartition/RedeemAtMaturityByPartitionCommand";
import { UpdateMaturityDateCommand } from "@command/bond/updateMaturityDate/UpdateMaturityDateCommand";
import { TIME_PERIODS_S } from "@core/Constants";
import { BondDetails } from "@domain/context/bond/BondDetails";
import { Coupon } from "@domain/context/bond/Coupon";
import { CastRateStatus, RateStatus } from "@domain/context/bond/RateStatus";
import ContractId from "@domain/context/contract/ContractId";
import {
  CastRegulationSubType,
  CastRegulationType,
  RegulationSubType,
  RegulationType,
} from "@domain/context/factory/RegulationType";
import { HederaId } from "@domain/context/shared/HederaId";
import { faker } from "@faker-js/faker/.";
import AddProceedRecipientRequest from "@port/in/request/bond/AddProceedRecipientRequest";
import CreateBondRequest from "@port/in/request/bond/CreateBondRequest";
import FullRedeemAtMaturityRequest from "@port/in/request/bond/FullRedeemAtMaturityRequest";
import GetAllCouponsRequest from "@port/in/request/bond/GetAllCouponsRequest";
import GetBondDetailsRequest from "@port/in/request/bond/GetBondDetailsRequest";
import GetCouponForRequest from "@port/in/request/bond/GetCouponForRequest";
import GetCouponHoldersRequest from "@port/in/request/bond/GetCouponHoldersRequest";
import GetCouponRequest from "@port/in/request/bond/GetCouponRequest";
import GetCouponsOrderedListRequest from "@port/in/request/bond/GetCouponsOrderedListRequest";
import GetPrincipalForRequest from "@port/in/request/bond/GetPrincipalForRequest";
import GetTotalCouponHoldersRequest from "@port/in/request/bond/GetTotalCouponHoldersRequest";
import UpdateMaturityDateRequest from "@port/in/request/bond/UpdateMaturityDateRequest";

import RedeemAtMaturityByPartitionRequest from "@port/in/request/bond/RedeemAtMaturityByPartitionRequest";
import RemoveProceedRecipientRequest from "@port/in/request/bond/RemoveProceedRecipientRequest";
import SetCouponRequest from "@port/in/request/bond/SetCouponRequest";
import UpdateProceedRecipientDataRequest from "@port/in/request/bond/UpdateProceedRecipientDataRequest";
import { GetCouponQuery } from "@query/bond/coupons/getCoupon/GetCouponQuery";
import { GetCouponAmountForQuery } from "@query/bond/coupons/getCouponAmountFor/GetCouponAmountForQuery";
import { GetCouponCountQuery } from "@query/bond/coupons/getCouponCount/GetCouponCountQuery";
import { GetCouponForQuery } from "@query/bond/coupons/getCouponFor/GetCouponForQuery";
import { GetCouponFromOrderedListAtQuery } from "@query/bond/coupons/getCouponFromOrderedListAt/GetCouponFromOrderedListAtQuery";
import { GetCouponHoldersQuery } from "@query/bond/coupons/getCouponHolders/GetCouponHoldersQuery";
import { GetTotalCouponHoldersQuery } from "@query/bond/coupons/getTotalCouponHolders/GetTotalCouponHoldersQuery";
import { GetBondDetailsQuery } from "@query/bond/get/getBondDetails/GetBondDetailsQuery";
import { GetPrincipalForQuery } from "@query/bond/get/getPrincipalFor/GetPrincipalForQuery";
import {
  CreateTrexSuiteBondRequest,
  GetProceedRecipientDataRequest,
  GetProceedRecipientsCountRequest,
  GetProceedRecipientsRequest,
  IsProceedRecipientRequest,
} from "src";
import { createFixture } from "../config";
import { ContractIdPropFixture, HederaIdPropsFixture, PartitionIdFixture } from "../shared/DataFixture";
import { SecurityPropsFixture } from "../shared/SecurityFixture";

export const SetCouponCommandFixture = createFixture<SetCouponCommand>((command) => {
  command.address.as(() => HederaIdPropsFixture.create().value);
  command.recordDate.faker((faker) => faker.date.future().getTime().toString());
  command.executionDate.faker((faker) => faker.date.future().getTime().toString());
  command.rate.faker((faker) => faker.number.int({ min: 100, max: 999 }).toString());
  command.startDate.faker((faker) => faker.date.future().getTime().toString());
  command.endDate.faker((faker) => faker.date.future().getTime().toString());
  command.fixingDate.faker((faker) => faker.date.future().getTime().toString());
});

export const CreateBondCommandFixture = createFixture<CreateBondCommand>((command) => {
  command.security.fromFixture(SecurityPropsFixture);
  command.currency.faker((faker) => faker.finance.currencyCode());
  command.nominalValue.faker((faker) => faker.finance.amount({ min: 1, max: 10, dec: 2 }));
  command.nominalValueDecimals.faker((faker) => faker.number.int({ min: 1, max: 5 }));
  command.startingDate.faker((faker) => faker.date.recent().getTime().toString());
  command.maturityDate.faker((faker) => faker.date.future({ years: 2 }).getTime().toString());
  command.factory?.as(() => new ContractId(ContractIdPropFixture.create().value));
  command.resolver?.as(() => new ContractId(ContractIdPropFixture.create().value));
  command.configId?.as(() => HederaIdPropsFixture.create().value);
  command.configVersion?.faker((faker) => faker.number.int({ min: 1, max: 5 }));
  command.diamondOwnerAccount?.as(() => HederaIdPropsFixture.create().value);
  command.externalControlListsIds?.as(() => [HederaIdPropsFixture.create().value]);
  command.externalKycListsIds?.as(() => [HederaIdPropsFixture.create().value]);
  command.complianceId?.as(() => HederaIdPropsFixture.create().value);
  command.identityRegistryId?.as(() => HederaIdPropsFixture.create().value);
  command.proceedRecipientsIds?.faker((faker) => [HederaIdPropsFixture.create().value]);
  command.proceedRecipientsData?.as(() => ["0x0000"]);
});

export const CreateTrexSuiteBondCommandFixture = createFixture<CreateTrexSuiteBondCommand>((command) => {
  command.salt.faker((faker) => faker.string.alphanumeric({ length: 32 }));
  command.owner.faker((faker) => faker.finance.accountName());
  command.irs.faker((faker) => faker.finance.iban());
  command.onchainId.faker((faker) => faker.finance.ethereumAddress());
  command.irAgents.faker((faker) => [faker.finance.ethereumAddress()]);
  command.tokenAgents.faker((faker) => [faker.finance.ethereumAddress()]);
  command.compliancesModules.faker((faker) => [faker.string.alphanumeric({ length: 32 })]);
  command.complianceSettings.faker((faker) => [faker.string.alphanumeric({ length: 32 })]);
  command.claimTopics.faker((faker) => [faker.number.int({ min: 1, max: 10 })]);
  command.issuers.faker((faker) => [faker.finance.ethereumAddress()]);
  command.issuerClaims.faker((faker) => [faker.number.int({ min: 1, max: 10 })]);

  command.security.fromFixture(SecurityPropsFixture);
  command.currency.faker((faker) => faker.finance.currencyCode());
  command.nominalValue.faker((faker) => faker.finance.amount({ min: 1, max: 10, dec: 2 }));
  command.nominalValueDecimals.faker((faker) => faker.number.int({ min: 1, max: 5 }));
  command.startingDate.faker((faker) => faker.date.recent().getTime().toString());
  command.maturityDate.faker((faker) => faker.date.future({ years: 2 }).getTime().toString());
  command.factory.as(() => new ContractId(ContractIdPropFixture.create().value));
  command.resolver.as(() => new ContractId(ContractIdPropFixture.create().value));
  command.configId.as(() => HederaIdPropsFixture.create().value);
  command.configVersion.faker((faker) => faker.number.int({ min: 1, max: 5 }));
  command.diamondOwnerAccount.as(() => HederaIdPropsFixture.create().value);
  command.externalControlLists?.as(() => [HederaIdPropsFixture.create().value]);
  command.externalKycLists?.as(() => [HederaIdPropsFixture.create().value]);
  command.compliance?.as(() => HederaIdPropsFixture.create().value);
  command.identityRegistry?.as(() => HederaIdPropsFixture.create().value);
  command.proceedRecipientsIds?.faker((faker) => [faker.finance.ethereumAddress()]);
  command.proceedRecipientsData?.faker((faker) => [faker.string.alphanumeric({ length: 32 })]);
});

export const UpdateMaturityDateCommandFixture = createFixture<UpdateMaturityDateCommand>((command) => {
  command.maturityDate.faker((faker) => faker.date.future().getTime().toString());
  command.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const RedeemAtMaturityByPartitionCommandFixture = createFixture<RedeemAtMaturityByPartitionCommand>(
  (command) => {
    command.amount.faker((faker) => faker.number.int({ min: 1, max: 1000 }).toString());
    command.securityId.as(() => HederaIdPropsFixture.create().value);
    command.sourceId.as(() => HederaIdPropsFixture.create().value);
    command.partitionId.as(() => PartitionIdFixture.create().value);
  },
);

export const FullRedeemAtMaturityCommandFixture = createFixture<FullRedeemAtMaturityCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.sourceId.as(() => HederaIdPropsFixture.create().value);
});

export const BondDetailsFixture = createFixture<BondDetails>((props) => {
  props.currency.faker((faker) => faker.finance.currencyCode());
  props.nominalValue.faker((faker) => faker.finance.amount({ min: 1, max: 10, dec: 2 }));
  props.nominalValueDecimals.faker((faker) => faker.number.int({ min: 1, max: 5 }));
  props.startingDate.faker((faker) => faker.date.past());
  props.maturityDate.faker((faker) => faker.date.recent());
});

export const GetCouponQueryFixture = createFixture<GetCouponQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.couponId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetCouponCountQueryFixture = createFixture<GetCouponCountQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetCouponForQueryFixture = createFixture<GetCouponForQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
  query.couponId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetCouponAmountForQueryFixture = createFixture<GetCouponAmountForQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
  query.couponId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetPrincipalForQueryFixture = createFixture<GetPrincipalForQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const GetBondDetailsQueryFixture = createFixture<GetBondDetailsQuery>((query) => {
  query.bondId.as(() => new HederaId(HederaIdPropsFixture.create().value));
});

export const GetCouponHoldersQueryFixture = createFixture<GetCouponHoldersQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.couponId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  query.start.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  query.end.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetTotalCouponHoldersQueryFixture = createFixture<GetTotalCouponHoldersQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.couponId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const GetCouponFromOrderedListAtQueryFixture = createFixture<GetCouponFromOrderedListAtQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.pos.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const CouponFixture = createFixture<Coupon>((props) => {
  props.recordTimeStamp.faker((faker) => faker.date.past().getTime().toString());
  props.executionTimeStamp.faker((faker) => faker.date.past().getTime().toString());
  props.rate.faker((faker) => BigInt(faker.number.int({ min: 1, max: 5 })));
  props.rateDecimals.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  props.startTimeStamp.faker((faker) => faker.date.past().getTime().toString());
  props.endTimeStamp.faker((faker) => faker.date.past().getTime().toString());
  props.fixingTimeStamp.faker((faker) => faker.date.past().getTime().toString());
  props.rateStatus.faker((faker) => faker.helpers.arrayElement(Object.values(RateStatus)));
});

export const GetCouponHoldersRequestFixture = createFixture<GetCouponHoldersRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.couponId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  request.start.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  request.end.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetTotalCouponHoldersRequestFixture = createFixture<GetTotalCouponHoldersRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.couponId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const CreateBondRequestFixture = createFixture<CreateBondRequest>((request) => {
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
  request.currency.faker((faker) => `0x${Buffer.from(faker.finance.currencyCode()).toString("hex")}`);
  request.nominalValue.faker((faker) => faker.finance.amount({ min: 1, max: 10, dec: 2 }));
  request.nominalValueDecimals.faker((faker) => faker.number.int({ min: 1, max: 5 }));
  let startingDate: Date;
  request.startingDate.faker((faker) => {
    startingDate = faker.date.recent();
    return startingDate.getTime().toString();
  });
  let maturityDate: Date;
  request.maturityDate.faker((faker) => {
    maturityDate = faker.date.future({ years: 2 });
    return maturityDate.getTime().toString();
  });

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
  request.proceedRecipientsIds?.faker((faker) => [HederaIdPropsFixture.create().value]);
  request.proceedRecipientsData?.as(() => ["0x0000"]);
});

export const GetBondDetailsRequestFixture = createFixture<GetBondDetailsRequest>((request) => {
  request.bondId.as(() => HederaIdPropsFixture.create().value);
});

export const SetCouponRequestFixture = createFixture<SetCouponRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.rate.faker((faker) => faker.number.int({ min: 1, max: 12 }).toString());
  request.recordTimestamp.faker((faker) => faker.date.past().getTime().toString());
  request.executionTimestamp.faker((faker) => faker.date.future().getTime().toString());
  request.startTimestamp.as(() => "0");
  request.endTimestamp.as(() => TIME_PERIODS_S.DAY.toString());
  request.fixingTimestamp.faker((faker) => faker.date.past().getTime().toString());
  request.rateStatus.faker((faker) => CastRateStatus.toNumber(faker.helpers.arrayElement(Object.values(RateStatus))));
});

export const GetCouponForRequestFixture = createFixture<GetCouponForRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
  request.couponId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const GetPrincipalForRequestFixture = createFixture<GetPrincipalForRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const GetCouponRequestFixture = createFixture<GetCouponRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.couponId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const GetAllCouponsRequestFixture = createFixture<GetAllCouponsRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetCouponsOrderedListRequestFixture = createFixture<GetCouponsOrderedListRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.pageIndex.as(() => faker.number.int({ min: 0, max: 10 }));
  request.pageLength.as(() => faker.number.int({ min: 1, max: 50 }));
});

export const UpdateMaturityDateRequestFixture = createFixture<UpdateMaturityDateRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.maturityDate.faker((faker) => faker.date.future().getTime().toString());
});

export const RedeemAtMaturityByPartitionRequestFixture = createFixture<RedeemAtMaturityByPartitionRequest>(
  (request) => {
    request.amount.faker((faker) => faker.number.int({ min: 1, max: 1000 }).toString());
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.sourceId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
  },
);

export const FullRedeemAtMaturityRequestFixture = createFixture<FullRedeemAtMaturityRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.sourceId.as(() => HederaIdPropsFixture.create().value);
});

export const CreateTrexSuiteBondRequestFixture = createFixture<CreateTrexSuiteBondRequest>((request) => {
  request.salt.faker((faker) => faker.string.alphanumeric({ length: 32 }));
  request.owner.faker((faker) => faker.finance.accountName());
  request.irs.faker((faker) => faker.finance.iban());
  request.onchainId.faker((faker) => faker.finance.ethereumAddress());
  request.irAgents.faker((faker) => [faker.finance.ethereumAddress()]);
  request.tokenAgents.faker((faker) => [faker.finance.ethereumAddress()]);
  request.compliancesModules.faker((faker) => [faker.string.alphanumeric({ length: 32 })]);
  request.complianceSettings.faker((faker) => [faker.string.alphanumeric({ length: 32 })]);
  request.claimTopics.faker((faker) => [faker.number.int({ min: 1, max: 10 })]);
  request.issuers.faker((faker) => [faker.finance.ethereumAddress()]);
  request.issuerClaims.faker((faker) => [faker.number.int({ min: 1, max: 10 })]);
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
  request.currency.faker((faker) => `0x${Buffer.from(faker.finance.currencyCode()).toString("hex")}`);
  request.nominalValue.faker((faker) => faker.finance.amount({ min: 1, max: 10, dec: 2 }));
  request.nominalValueDecimals.faker((faker) => faker.number.int({ min: 1, max: 5 }));
  let startingDate: Date;
  request.startingDate.faker((faker) => {
    startingDate = faker.date.recent();
    return startingDate.getTime().toString();
  });
  let maturityDate: Date;
  request.maturityDate.faker((faker) => {
    maturityDate = faker.date.future({ years: 2 });
    return maturityDate.getTime().toString();
  });

  request.configId.faker(
    (faker) =>
      `0x000000000000000000000000000000000000000000000000000000000000000${faker.number.int({ min: 1, max: 9 })}`,
  );
  request.configVersion.as(() => 1);
  request.diamondOwnerAccount?.as(() => HederaIdPropsFixture.create().value);
  request.proceedRecipientsIds?.faker((faker) => [faker.finance.ethereumAddress()]);
  request.proceedRecipientsData?.faker((faker) => ["0x0000"]);
  request.externalPauses?.as(() => [HederaIdPropsFixture.create().value]);
  request.externalControlLists?.as(() => [HederaIdPropsFixture.create().value]);
  request.externalKycLists?.as(() => [HederaIdPropsFixture.create().value]);
  request.complianceId?.as(() => HederaIdPropsFixture.create().value);
  request.identityRegistryId?.as(() => HederaIdPropsFixture.create().value);
});

export const AddProceedRecipientRequestFixture = createFixture<AddProceedRecipientRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.proceedRecipientId.as(() => HederaIdPropsFixture.create().value);
  request.data?.as(() => "0x");
});
export const UpdateProceedRecipientDataRequestFixture = createFixture<UpdateProceedRecipientDataRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.proceedRecipientId.as(() => HederaIdPropsFixture.create().value);
  request.data.as(() => "0x");
});

export const RemoveProceedRecipientRequestFixture = createFixture<RemoveProceedRecipientRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.proceedRecipientId.as(() => HederaIdPropsFixture.create().value);
});

export const IsProceedRecipientRequestFixture = createFixture<IsProceedRecipientRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.proceedRecipientId.as(() => HederaIdPropsFixture.create().value);
});

export const GetProceedRecipientsRequestFixture = createFixture<GetProceedRecipientsRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.pageIndex.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  request.pageSize.faker((faker) => faker.number.int({ min: 1, max: 50 }));
});

export const GetProceedRecipientsCountRequestFixture = createFixture<GetProceedRecipientsCountRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});
export const GetProceedRecipientDataRequestFixture = createFixture<GetProceedRecipientDataRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.proceedRecipientId.as(() => HederaIdPropsFixture.create().value);
});
