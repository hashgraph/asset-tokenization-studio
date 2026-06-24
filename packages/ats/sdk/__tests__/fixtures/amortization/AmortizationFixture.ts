// SPDX-License-Identifier: Apache-2.0

import { createFixture } from "../config";
import { HederaIdPropsFixture } from "../shared/DataFixture";
import { SetAmortizationCommand } from "@command/amortization/set/SetAmortizationCommand";
import { CancelAmortizationCommand } from "@command/amortization/cancel/CancelAmortizationCommand";
import { SetAmortizationHoldCommand } from "@command/amortization/setHold/SetAmortizationHoldCommand";
import { ReleaseAmortizationHoldCommand } from "@command/amortization/releaseHold/ReleaseAmortizationHoldCommand";
import { GetAmortizationQuery } from "@query/amortization/getAmortization/GetAmortizationQuery";
import { GetAmortizationForQuery } from "@query/amortization/getAmortizationFor/GetAmortizationForQuery";
import { GetAmortizationsForQuery } from "@query/amortization/getAmortizationsFor/GetAmortizationsForQuery";
import { GetAmortizationsCountQuery } from "@query/amortization/getAmortizationsCount/GetAmortizationsCountQuery";
import { GetAmortizationHoldersQuery } from "@query/amortization/getAmortizationHolders/GetAmortizationHoldersQuery";
import { GetTotalAmortizationHoldersQuery } from "@query/amortization/getTotalAmortizationHolders/GetTotalAmortizationHoldersQuery";
import { GetAmortizationPaymentAmountQuery } from "@query/amortization/getAmortizationPaymentAmount/GetAmortizationPaymentAmountQuery";
import { GetActiveAmortizationHoldHoldersQuery } from "@query/amortization/getActiveAmortizationHoldHolders/GetActiveAmortizationHoldHoldersQuery";
import { GetTotalActiveAmortizationHoldHoldersQuery } from "@query/amortization/getTotalActiveAmortizationHoldHolders/GetTotalActiveAmortizationHoldHoldersQuery";
import { GetActiveAmortizationIdsQuery } from "@query/amortization/getActiveAmortizationIds/GetActiveAmortizationIdsQuery";
import { GetTotalActiveAmortizationIdsQuery } from "@query/amortization/getTotalActiveAmortizationIds/GetTotalActiveAmortizationIdsQuery";
import SetAmortizationRequest from "@port/in/request/security/amortization/SetAmortizationRequest";
import CancelAmortizationRequest from "@port/in/request/security/amortization/CancelAmortizationRequest";
import SetAmortizationHoldRequest from "@port/in/request/security/amortization/SetAmortizationHoldRequest";
import ReleaseAmortizationHoldRequest from "@port/in/request/security/amortization/ReleaseAmortizationHoldRequest";
import GetAmortizationRequest from "@port/in/request/security/amortization/GetAmortizationRequest";
import GetAmortizationForRequest from "@port/in/request/security/amortization/GetAmortizationForRequest";
import GetAmortizationsForRequest from "@port/in/request/security/amortization/GetAmortizationsForRequest";
import GetAmortizationsCountRequest from "@port/in/request/security/amortization/GetAmortizationsCountRequest";
import GetAmortizationHoldersRequest from "@port/in/request/security/amortization/GetAmortizationHoldersRequest";
import GetTotalAmortizationHoldersRequest from "@port/in/request/security/amortization/GetTotalAmortizationHoldersRequest";
import GetAmortizationPaymentAmountRequest from "@port/in/request/security/amortization/GetAmortizationPaymentAmountRequest";
import GetActiveAmortizationHoldHoldersRequest from "@port/in/request/security/amortization/GetActiveAmortizationHoldHoldersRequest";
import GetTotalActiveAmortizationHoldHoldersRequest from "@port/in/request/security/amortization/GetTotalActiveAmortizationHoldHoldersRequest";
import GetActiveAmortizationIdsRequest from "@port/in/request/security/amortization/GetActiveAmortizationIdsRequest";
import GetTotalActiveAmortizationIdsRequest from "@port/in/request/security/amortization/GetTotalActiveAmortizationIdsRequest";
import { RegisteredAmortization } from "@domain/context/amortization/RegisteredAmortization";
import { Amortization } from "@domain/context/amortization/Amortization";
import { AmortizationFor } from "@domain/context/amortization/AmortizationFor";
import { AmortizationPaymentAmount } from "@domain/context/amortization/AmortizationPaymentAmount";
import BigDecimal from "@domain/context/shared/BigDecimal";

// ---- Command Fixtures ----

export const SetAmortizationCommandFixture = createFixture<SetAmortizationCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.recordDate.faker((faker) => faker.date.future().getTime().toString());
  command.executionDate.faker((faker) => faker.date.future().getTime().toString());
  command.tokensToRedeem.faker((faker) => faker.number.int({ min: 1 }).toString());
});

export const CancelAmortizationCommandFixture = createFixture<CancelAmortizationCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.amortizationId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const SetAmortizationHoldCommandFixture = createFixture<SetAmortizationHoldCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.amortizationId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  command.tokenHolder.as(() => HederaIdPropsFixture.create().value);
  command.tokenAmount.faker((faker) => faker.number.int({ min: 1 }).toString());
});

export const ReleaseAmortizationHoldCommandFixture = createFixture<ReleaseAmortizationHoldCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.amortizationId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  command.tokenHolder.as(() => HederaIdPropsFixture.create().value);
});

// ---- Query Fixtures ----

export const GetAmortizationQueryFixture = createFixture<GetAmortizationQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.amortizationId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetAmortizationForQueryFixture = createFixture<GetAmortizationForQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
  query.amortizationId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetAmortizationsForQueryFixture = createFixture<GetAmortizationsForQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.amortizationId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  query.start.faker((faker) => faker.number.int({ min: 0, max: 10 }));
  query.end.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const GetAmortizationsCountQueryFixture = createFixture<GetAmortizationsCountQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetAmortizationHoldersQueryFixture = createFixture<GetAmortizationHoldersQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.amortizationId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  query.start.faker((faker) => faker.number.int({ min: 0, max: 10 }));
  query.end.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const GetTotalAmortizationHoldersQueryFixture = createFixture<GetTotalAmortizationHoldersQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.amortizationId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const GetAmortizationPaymentAmountQueryFixture = createFixture<GetAmortizationPaymentAmountQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.amortizationId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  query.tokenHolder.as(() => HederaIdPropsFixture.create().value);
});

export const GetActiveAmortizationHoldHoldersQueryFixture = createFixture<GetActiveAmortizationHoldHoldersQuery>(
  (query) => {
    query.securityId.as(() => HederaIdPropsFixture.create().value);
    query.amortizationId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
    query.start.faker((faker) => faker.number.int({ min: 0, max: 10 }));
    query.end.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  },
);

export const GetTotalActiveAmortizationHoldHoldersQueryFixture =
  createFixture<GetTotalActiveAmortizationHoldHoldersQuery>((query) => {
    query.securityId.as(() => HederaIdPropsFixture.create().value);
    query.amortizationId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  });

export const GetActiveAmortizationIdsQueryFixture = createFixture<GetActiveAmortizationIdsQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.start.faker((faker) => faker.number.int({ min: 0, max: 10 }));
  query.end.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const GetTotalActiveAmortizationIdsQueryFixture = createFixture<GetTotalActiveAmortizationIdsQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
});

// ---- Request Fixtures ----

export const SetAmortizationRequestFixture = createFixture<SetAmortizationRequest>((request) => {
  const time = Math.ceil(new Date().getTime() / 1000);
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.recordTimestamp.as(() => (time + 100).toString());
  request.executionTimestamp.as(() => (time + 200).toString());
  request.tokensToRedeem.faker((faker) => faker.finance.amount({ min: 1, max: 1000, dec: 0 }));
});

export const CancelAmortizationRequestFixture = createFixture<CancelAmortizationRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.amortizationId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const SetAmortizationHoldRequestFixture = createFixture<SetAmortizationHoldRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.amortizationId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  request.tokenHolder.as(() => HederaIdPropsFixture.create().value);
  request.tokenAmount.faker((faker) => faker.finance.amount({ min: 1, max: 1000, dec: 0 }));
});

export const ReleaseAmortizationHoldRequestFixture = createFixture<ReleaseAmortizationHoldRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.amortizationId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  request.tokenHolder.as(() => HederaIdPropsFixture.create().value);
});

export const GetAmortizationRequestFixture = createFixture<GetAmortizationRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.amortizationId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetAmortizationForRequestFixture = createFixture<GetAmortizationForRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
  request.amortizationId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const GetAmortizationsForRequestFixture = createFixture<GetAmortizationsForRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.amortizationId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  request.start.faker((faker) => faker.number.int({ min: 0, max: 10 }));
  request.end.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const GetAmortizationsCountRequestFixture = createFixture<GetAmortizationsCountRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetAmortizationHoldersRequestFixture = createFixture<GetAmortizationHoldersRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.amortizationId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  request.start.faker((faker) => faker.number.int({ min: 0, max: 10 }));
  request.end.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const GetTotalAmortizationHoldersRequestFixture = createFixture<GetTotalAmortizationHoldersRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.amortizationId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  },
);

export const GetAmortizationPaymentAmountRequestFixture = createFixture<GetAmortizationPaymentAmountRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.amortizationId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
    request.tokenHolder.as(() => HederaIdPropsFixture.create().value);
  },
);

export const GetActiveAmortizationHoldHoldersRequestFixture = createFixture<GetActiveAmortizationHoldHoldersRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.amortizationId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
    request.start.faker((faker) => faker.number.int({ min: 0, max: 10 }));
    request.end.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  },
);

export const GetTotalActiveAmortizationHoldHoldersRequestFixture =
  createFixture<GetTotalActiveAmortizationHoldHoldersRequest>((request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.amortizationId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
  });

export const GetActiveAmortizationIdsRequestFixture = createFixture<GetActiveAmortizationIdsRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.start.faker((faker) => faker.number.int({ min: 0, max: 10 }));
  request.end.faker((faker) => faker.number.int({ min: 1, max: 10 }));
});

export const GetTotalActiveAmortizationIdsRequestFixture = createFixture<GetTotalActiveAmortizationIdsRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
  },
);

// ---- Domain Fixtures ----

export const AmortizationDomainFixture = createFixture<Amortization>((props) => {
  props.recordDate.faker((faker) => faker.number.int({ min: 1000000, max: 9999999 }));
  props.executionDate.faker((faker) => faker.number.int({ min: 1000000, max: 9999999 }));
  props.tokensToRedeem.faker((faker) => BigDecimal.fromString(faker.finance.amount({ min: 1, max: 10000, dec: 0 })));
});

export const RegisteredAmortizationFixture = createFixture<RegisteredAmortization>((props) => {
  props.amortization.as(() => AmortizationDomainFixture.create());
  props.snapshotId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  props.isDisabled.faker((faker) => faker.datatype.boolean());
});

export const AmortizationForFixture = createFixture<AmortizationFor>((props) => {
  props.recordDate.faker((faker) => faker.number.int({ min: 1000000, max: 9999999 }));
  props.executionDate.faker((faker) => faker.number.int({ min: 1000000, max: 9999999 }));
  props.holdId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  props.holdActive.faker((faker) => faker.datatype.boolean());
  props.tokenHeldAmount.faker((faker) => BigDecimal.fromString(faker.finance.amount({ min: 0, max: 10000, dec: 0 })));
  props.decimalsHeld.faker((faker) => faker.number.int({ min: 0, max: 18 }));
  props.abafAtHold.faker((faker) => BigDecimal.fromString(faker.finance.amount({ min: 0, max: 10000, dec: 0 })));
  props.tokenBalance.faker((faker) => BigDecimal.fromString(faker.finance.amount({ min: 0, max: 10000, dec: 0 })));
  props.decimalsBalance.faker((faker) => faker.number.int({ min: 0, max: 18 }));
  props.recordDateReached.faker((faker) => faker.datatype.boolean());
  props.abafAtSnapshot.faker((faker) => BigDecimal.fromString(faker.finance.amount({ min: 0, max: 10000, dec: 0 })));
  props.nominalValue.faker((faker) => BigDecimal.fromString(faker.finance.amount({ min: 1, max: 10000, dec: 0 })));
  props.nominalValueDecimals.faker((faker) => faker.number.int({ min: 0, max: 18 }));
});

export const AmortizationPaymentAmountFixture = createFixture<AmortizationPaymentAmount>((props) => {
  props.tokenAmount.faker((faker) => BigDecimal.fromString(faker.finance.amount({ min: 1, max: 10000, dec: 0 })));
  props.decimals.faker((faker) => faker.number.int({ min: 0, max: 18 }));
});
