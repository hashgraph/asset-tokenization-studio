// SPDX-License-Identifier: Apache-2.0

import CreateEquityRequest from "@port/in/request/equity/CreateEquityRequest";
import { createFixture } from "../config";
import {
  CastRegulationSubType,
  CastRegulationType,
  RegulationSubType,
  RegulationType,
} from "@domain/context/factory/RegulationType";
import { ContractIdPropFixture, HederaIdPropsFixture } from "../shared/DataFixture";
import { HederaId } from "@domain/context/shared/HederaId";
import { GetScheduledBalanceAdjustmentQuery } from "@query/equity/balanceAdjustments/getScheduledBalanceAdjustment/GetScheduledBalanceAdjustmentQuery";
import { faker } from "@faker-js/faker/.";
import GetEquityDetailsRequest from "@port/in/request/equity/GetEquityDetailsRequest";
import SetDividendsRequest from "@port/in/request/equity/SetDividendsRequest";
import GetDividendsForRequest from "@port/in/request/equity/GetDividendsForRequest";
import GetDividendsRequest from "@port/in/request/equity/GetDividendsRequest";
import GetAllDividendsRequest from "@port/in/request/equity/GetAllDividendsRequest";
import SetVotingRightsRequest from "@port/in/request/equity/SetVotingRightsRequest";
import GetVotingRightsForRequest from "@port/in/request/equity/GetVotingRightsForRequest";
import GetVotingRightsRequest from "@port/in/request/equity/GetVotingRightsRequest";
import GetAllVotingRightsRequest from "@port/in/request/equity/GetAllVotingRightsRequest";
import SetScheduledBalanceAdjustmentRequest from "@port/in/request/equity/SetScheduledBalanceAdjustmentRequest";
import GetScheduledBalanceAdjustmentCountRequest from "@port/in/request/equity/GetScheduledBalanceAdjustmentsCountRequest";
import GetScheduledBalanceAdjustmentRequest from "@port/in/request/equity/GetScheduledBalanceAdjustmentRequest";
import GetAllScheduledBalanceAdjustmentsRequest from "@port/in/request/equity/GetAllScheduledBalanceAdjustmentst";
import { ScheduledBalanceAdjustment } from "@domain/context/equity/ScheduledBalanceAdjustment";
import { GetScheduledBalanceAdjustmentCountQuery } from "@query/equity/balanceAdjustments/getScheduledBalanceAdjustmentCount/GetScheduledBalanceAdjustmentsCountQuery";
import { Dividend } from "@domain/context/equity/Dividend";
import { GetDividendsCountQuery } from "@query/equity/dividends/getDividendsCount/GetDividendsCountQuery";
import { GetDividendsQuery } from "@query/equity/dividends/getDividends/GetDividendsQuery";
import { GetDividendsForQuery } from "@query/equity/dividends/getDividendsFor/GetDividendsForQuery";
import { GetDividendAmountForQuery } from "@query/equity/dividends/getDividendAmountFor/GetDividendAmountForQuery";
import { DividendFor } from "@domain/context/equity/DividendFor";
import { GetEquityDetailsQuery } from "@query/equity/get/getEquityDetails/GetEquityDetailsQuery";
import { EquityDetails } from "@domain/context/equity/EquityDetails";
import { GetVotingQuery } from "@query/equity/votingRights/getVoting/GetVotingQuery";
import { GetVotingCountQuery } from "@query/equity/votingRights/getVotingCount/GetVotingCountQuery";
import { GetVotingForQuery } from "@query/equity/votingRights/getVotingFor/GetVotingForQuery";
import { CastDividendType, DividendType } from "@domain/context/equity/DividendType";
import { VotingFor } from "@domain/context/equity/VotingFor";
import { VotingRights } from "@domain/context/equity/VotingRights";
import { GetRegulationDetailsQuery } from "@query/factory/get/GetRegulationDetailsQuery";
import { GetConfigInfoQuery } from "@query/management/GetConfigInfoQuery";
import { SetScheduledBalanceAdjustmentCommand } from "@command/equity/balanceAdjustments/setScheduledBalanceAdjustment/SetScheduledBalanceAdjustmentCommand";
import { CreateEquityCommand } from "@command/equity/create/CreateEquityCommand";
import { SetDividendsCommand } from "@command/equity/dividends/set/SetDividendsCommand";
import { SetVotingRightsCommand } from "@command/equity/votingRights/set/SetVotingRightsCommand";
import ContractId from "@domain/context/contract/ContractId";
import { SecurityPropsFixture } from "../shared/SecurityFixture";
import { GetDividendHoldersQuery } from "@query/equity/dividends/getDividendHolders/GetDividendHoldersQuery";
import { GetTotalDividendHoldersQuery } from "@query/equity/dividends/getTotalDividendHolders/GetTotalDividendHoldersQuery";
import { GetVotingHoldersQuery } from "@query/equity/votingRights/getVotingHolders/GetVotingHoldersQuery";
import { GetTotalVotingHoldersQuery } from "@query/equity/votingRights/getTotalVotingHolders/GetTotalVotingHoldersQuery";
import GetDividendHoldersRequest from "@port/in/request/equity/GetDividendHoldersRequest";
import GetTotalDividendHoldersRequest from "@port/in/request/equity/GetTotalDividendHoldersRequest";
import GetVotingHoldersRequest from "@port/in/request/equity/GetVotingHoldersRequest";
import GetTotalVotingHoldersRequest from "@port/in/request/equity/GetTotalVotingHoldersRequest";
import { CreateTrexSuiteEquityCommand } from "@command/equity/createTrexSuite/CreateTrexSuiteEquityCommand";
import { CreateTrexSuiteEquityRequest } from "src";

export const CreateEquityRequestFixture = createFixture<CreateEquityRequest>((request) => {
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
  request.numberOfShares.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
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
  request.dividendRight.faker((faker) =>
    CastDividendType.toNumber(faker.helpers.arrayElement(Object.values(DividendType))),
  );
  request.nominalValue.faker((faker) => faker.finance.amount({ min: 1, max: 10, dec: 2 }));
  request.nominalValueDecimals.faker((faker) => faker.number.int({ min: 1, max: 5 }));
  request.votingRight.faker((faker) => faker.datatype.boolean());
  request.liquidationRight.faker((faker) => faker.datatype.boolean());
  request.subscriptionRight.faker((faker) => faker.datatype.boolean());
  request.conversionRight.faker((faker) => faker.datatype.boolean());
  request.redemptionRight.faker((faker) => faker.datatype.boolean());
  request.putRight.faker((faker) => faker.datatype.boolean());
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
});

export const GetEquityDetailsRequestFixture = createFixture<GetEquityDetailsRequest>((request) => {
  request.equityId.as(() => HederaIdPropsFixture.create().value);
});

export const SetDividendsRequestFixture = createFixture<SetDividendsRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.amountPerUnitOfSecurity.faker((faker) => faker.number.int({ min: 1, max: 12 }).toString());
  request.recordTimestamp.faker((faker) => faker.date.past().getTime().toString());
  request.executionTimestamp.faker((faker) => faker.date.future().getTime().toString());
});

export const GetDividendsForRequestFixture = createFixture<GetDividendsForRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
  request.dividendId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const GetDividendsRequestFixture = createFixture<GetDividendsRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.dividendId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const GetAllDividendsRequestFixture = createFixture<GetAllDividendsRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const SetVotingRightsRequestFixture = createFixture<SetVotingRightsRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.recordTimestamp.faker((faker) => faker.date.past().getTime().toString());
  request.data.as(() => "0x");
});

export const GetVotingRightsForRequestFixture = createFixture<GetVotingRightsForRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
  request.votingId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const GetVotingRightsRequestFixture = createFixture<GetVotingRightsRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.votingId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const GetAllVotingRightsRequestFixture = createFixture<GetAllVotingRightsRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const SetScheduledBalanceAdjustmentRequestFixture = createFixture<SetScheduledBalanceAdjustmentRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.executionDate.faker((faker) => faker.date.past().getTime().toString());
    request.factor.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
    request.decimals.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
  },
);

export const GetScheduledBalanceAdjustmentCountRequestFixture =
  createFixture<GetScheduledBalanceAdjustmentCountRequest>((request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
  });

export const GetScheduledBalanceAdjustmentRequestFixture = createFixture<GetScheduledBalanceAdjustmentRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.balanceAdjustmentId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  },
);

export const GetAllScheduledBalanceAdjustmentsRequestFixture = createFixture<GetAllScheduledBalanceAdjustmentsRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
  },
);

export const GetDividendHoldersRequestFixture = createFixture<GetDividendHoldersRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.dividendId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  request.start.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  request.end.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetTotalDividendHoldersRequestFixture = createFixture<GetTotalDividendHoldersRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.dividendId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const GetVotingHoldersRequestFixture = createFixture<GetVotingHoldersRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.voteId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  request.start.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  request.end.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetTotalVotingHoldersRequestFixture = createFixture<GetTotalVotingHoldersRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.voteId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const GetScheduledBalanceAdjustmentQueryFixture = createFixture<GetScheduledBalanceAdjustmentQuery>((query) => {
  query.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  query.balanceAdjustmentId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetScheduledBalanceAdjustmentCountQueryFixture = createFixture<GetScheduledBalanceAdjustmentCountQuery>(
  (query) => {
    query.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  },
);

export const GetDividendsCountQueryFixture = createFixture<GetDividendsCountQuery>((query) => {
  query.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
});

export const GetDividendsForQueryFixture = createFixture<GetDividendsForQuery>((query) => {
  query.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  query.targetId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  query.dividendId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetDividendAmountForQueryFixture = createFixture<GetDividendAmountForQuery>((query) => {
  query.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  query.targetId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  query.dividendId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetDividendsQueryFixture = createFixture<GetDividendsQuery>((query) => {
  query.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  query.dividendId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetVotingQueryFixture = createFixture<GetVotingQuery>((query) => {
  query.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  query.votingId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetVotingCountQueryFixture = createFixture<GetVotingCountQuery>((query) => {
  query.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
});

export const GetVotingForQueryFixture = createFixture<GetVotingForQuery>((query) => {
  query.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  query.targetId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  query.votingId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetEquityDetailsQueryFixture = createFixture<GetEquityDetailsQuery>((query) => {
  query.equityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
});

export const GetRegulationDetailsQueryFixture = createFixture<GetRegulationDetailsQuery>((query) => {
  query.type.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  query.subType.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  query.factory?.as(() => new HederaId(HederaIdPropsFixture.create().value));
});

export const GetConfigInfoQueryFixture = createFixture<GetConfigInfoQuery>((query) => {
  query.securityId.as(() => new HederaId(HederaIdPropsFixture.create().value));
});

export const GetDividendHoldersQueryFixture = createFixture<GetDividendHoldersQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.dividendId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  query.start.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  query.end.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetTotalDividendHoldersQueryFixture = createFixture<GetTotalDividendHoldersQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.dividendId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const GetVotingHoldersQueryFixture = createFixture<GetVotingHoldersQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.voteId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  query.start.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  query.end.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetTotalVotingHoldersQueryFixture = createFixture<GetTotalVotingHoldersQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.voteId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const CreateEquityCommandFixture = createFixture<CreateEquityCommand>((command) => {
  command.security.fromFixture(SecurityPropsFixture);
  command.currency.faker((faker) => faker.finance.currencyCode());
  command.nominalValue.faker((faker) => faker.finance.amount({ min: 1, max: 10, dec: 2 }));
  command.nominalValueDecimals.faker((faker) => faker.number.int({ min: 1, max: 5 }));
  command.votingRight.faker((faker) => faker.datatype.boolean());
  command.informationRight.faker((faker) => faker.datatype.boolean());
  command.liquidationRight.faker((faker) => faker.datatype.boolean());
  command.subscriptionRight.faker((faker) => faker.datatype.boolean());
  command.conversionRight.faker((faker) => faker.datatype.boolean());
  command.redemptionRight.faker((faker) => faker.datatype.boolean());
  command.putRight.faker((faker) => faker.datatype.boolean());
  command.dividendRight.faker((faker) => faker.datatype.boolean());
  command.currency.faker((faker) => faker.string.hexadecimal({ length: 6, casing: "lower", prefix: "0x" }));
  command.factory?.as(() => new ContractId(ContractIdPropFixture.create().value));
  command.resolver?.as(() => new ContractId(ContractIdPropFixture.create().value));
  command.configId?.faker((faker) => faker.string.hexadecimal({ length: 64, casing: "lower", prefix: "0x" }));
  command.configVersion?.faker((faker) => faker.number.int({ min: 1, max: 5 }));
  command.diamondOwnerAccount?.as(() => HederaIdPropsFixture.create().value);
  command.externalControlListsIds?.as(() => [HederaIdPropsFixture.create().value]);
  command.externalKycListsIds?.as(() => [HederaIdPropsFixture.create().value]);
  command.complianceId?.as(() => HederaIdPropsFixture.create().value);
  command.identityRegistryId?.as(() => HederaIdPropsFixture.create().value);
});

export const CreateTrexSuiteEquityCommandFixture = createFixture<CreateTrexSuiteEquityCommand>((command) => {
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
  command.votingRight.faker((faker) => faker.datatype.boolean());
  command.informationRight.faker((faker) => faker.datatype.boolean());
  command.liquidationRight.faker((faker) => faker.datatype.boolean());
  command.subscriptionRight.faker((faker) => faker.datatype.boolean());
  command.conversionRight.faker((faker) => faker.datatype.boolean());
  command.redemptionRight.faker((faker) => faker.datatype.boolean());
  command.putRight.faker((faker) => faker.datatype.boolean());
  command.dividendRight.faker((faker) => faker.datatype.boolean());
  command.currency.faker((faker) => faker.string.hexadecimal({ length: 6, casing: "lower", prefix: "0x" }));
  command.factory?.as(() => new ContractId(ContractIdPropFixture.create().value));
  command.resolver?.as(() => new ContractId(ContractIdPropFixture.create().value));
  command.configId?.faker((faker) => faker.string.hexadecimal({ length: 64, casing: "lower", prefix: "0x" }));
  command.configVersion?.faker((faker) => faker.number.int({ min: 1, max: 5 }));
  command.diamondOwnerAccount?.as(() => HederaIdPropsFixture.create().value);
  command.externalControlLists?.as(() => [HederaIdPropsFixture.create().value]);
  command.externalKycLists?.as(() => [HederaIdPropsFixture.create().value]);
  command.compliance?.as(() => HederaIdPropsFixture.create().value);
  command.identityRegistry?.as(() => HederaIdPropsFixture.create().value);
});

export const SetScheduledBalanceAdjustmentCommandFixture = createFixture<SetScheduledBalanceAdjustmentCommand>(
  (command) => {
    command.securityId.as(() => HederaIdPropsFixture.create().value);
    command.executionDate.faker((faker) => faker.date.future().getTime().toString());
    command.factor.faker((faker) => faker.number.int().toString());
    command.decimals.faker((faker) => faker.number.int().toString());
  },
);

export const SetDividendsCommandFixture = createFixture<SetDividendsCommand>((command) => {
  command.address.as(() => HederaIdPropsFixture.create().value);
  let recordDate: Date;
  command.recordDate.faker((faker) => {
    recordDate = faker.date.future();
    return recordDate.getTime().toString();
  });
  command.executionDate.faker((faker) => {
    return faker.date.future({ refDate: recordDate }).getTime().toString();
  });
  command.amount.faker((faker) => faker.number.int().toString());
});

export const SetVotingRightsCommandFixture = createFixture<SetVotingRightsCommand>((command) => {
  command.address.as(() => HederaIdPropsFixture.create().value);
  command.recordDate.faker((faker) => faker.date.future().getTime().toString());
  command.data.faker((faker) => {
    return faker.string.hexadecimal({
      length: 64,
      casing: "lower",
      prefix: "0x",
    });
  });
});

export const ScheduledBalanceAdjustmentFixture = createFixture<ScheduledBalanceAdjustment>((props) => {
  props.executionTimeStamp.faker((faker) => faker.date.future());
  props.factor.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  props.decimals.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const DividendFixture = createFixture<Dividend>((props) => {
  props.amountPerUnitOfSecurity.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  props.recordTimeStamp.faker((faker) => faker.date.past());
  props.executionTimeStamp.faker((faker) => faker.date.future());
  props.snapshotId?.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const DividendForFixture = createFixture<DividendFor>((props) => {
  props.tokenBalance.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  props.decimals.faker((faker) => faker.date.past());
});

export const EquityDetailsFixture = createFixture<EquityDetails>((props) => {
  props.votingRight.faker((faker) => faker.datatype.boolean());
  props.informationRight.faker((faker) => faker.datatype.boolean());
  props.liquidationRight.faker((faker) => faker.datatype.boolean());
  props.subscriptionRight.faker((faker) => faker.datatype.boolean());
  props.conversionRight.faker((faker) => faker.datatype.boolean());
  props.redemptionRight.faker((faker) => faker.datatype.boolean());
  props.putRight.faker((faker) => faker.datatype.boolean());
  props.dividendRight.faker((faker) => faker.helpers.arrayElement(Object.values(DividendType)));
  props.currency.faker((faker) => faker.finance.currencyCode());
  props.nominalValue.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  props.nominalValueDecimals.faker((faker) => faker.number.int({ min: 1, max: 5 }));
});

export const VotingForFixture = createFixture<VotingFor>((props) => {
  props.tokenBalance.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  props.decimals.faker((faker) => faker.date.past());
});

export const VotingRightsFixture = createFixture<VotingRights>((props) => {
  props.data.faker((faker) => faker.lorem.words());
  props.recordTimeStamp.faker((faker) => faker.date.past());
  props.snapshotId?.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const CreateTrexSuiteEquityRequestFixture = createFixture<CreateTrexSuiteEquityRequest>((request) => {
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
  request.numberOfShares.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
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
  request.dividendRight.faker((faker) =>
    CastDividendType.toNumber(faker.helpers.arrayElement(Object.values(DividendType))),
  );
  request.nominalValue.faker((faker) => faker.finance.amount({ min: 1, max: 10, dec: 2 }));
  request.nominalValueDecimals.faker((faker) => faker.number.int({ min: 1, max: 5 }));
  request.votingRight.faker((faker) => faker.datatype.boolean());
  request.liquidationRight.faker((faker) => faker.datatype.boolean());
  request.subscriptionRight.faker((faker) => faker.datatype.boolean());
  request.conversionRight.faker((faker) => faker.datatype.boolean());
  request.redemptionRight.faker((faker) => faker.datatype.boolean());
  request.putRight.faker((faker) => faker.datatype.boolean());
  request.configId.faker(
    (faker) =>
      `0x000000000000000000000000000000000000000000000000000000000000000${faker.number.int({ min: 1, max: 9 })}`,
  );
  request.configVersion.as(() => 1);
  request.diamondOwnerAccount.as(() => HederaIdPropsFixture.create().value);
  request.externalPauses?.as(() => [HederaIdPropsFixture.create().value]);
  request.externalControlLists?.as(() => [HederaIdPropsFixture.create().value]);
  request.externalKycLists?.as(() => [HederaIdPropsFixture.create().value]);
  request.complianceId?.as(() => HederaIdPropsFixture.create().value);
  request.identityRegistryId?.as(() => HederaIdPropsFixture.create().value);
});
