// SPDX-License-Identifier: Apache-2.0

import { createFixture } from "../config";
import { HederaIdPropsFixture, PartitionIdFixture } from "../shared/DataFixture";
import { GetClearedAmountForQuery } from "@query/security/clearing/getClearedAmountFor/GetClearedAmountForQuery";
import { GetClearedAmountForByPartitionQuery } from "@query/security/clearing/getClearedAmountForByPartition/GetClearedAmountForByPartitionQuery";
import { GetClearingCountForByPartitionQuery } from "@query/security/clearing/getClearingCountForByPartition/GetClearingCountForByPartitionQuery";
import ActivateClearingRequest from "@port/in/request/security/operations/clearing/ActivateClearingRequest";
import DeactivateClearingRequest from "@port/in/request/security/operations/clearing/DeactivateClearingRequest";
import ClearingTransferByPartitionRequest from "@port/in/request/security/operations/clearing/ClearingTransferByPartitionRequest";
import ClearingTransferFromByPartitionRequest from "@port/in/request/security/operations/clearing/ClearingTransferFromByPartitionRequest";
import ProtectedClearingTransferByPartitionRequest from "@port/in/request/security/operations/clearing/ProtectedClearingTransferByPartitionRequest";
import ApproveClearingOperationByPartitionRequest from "@port/in/request/security/operations/clearing/ApproveClearingOperationByPartitionRequest";
import {
  ClearingHoldCreation,
  ClearingOperationType,
  ClearingRedeem,
  ClearingTransfer,
} from "@domain/context/security/Clearing";
import { GetClearingCreateHoldForByPartitionQuery } from "@query/security/clearing/getClearingCreateHoldForByPartition/GetClearingCreateHoldForByPartitionQuery";
import CancelClearingOperationByPartitionRequest from "@port/in/request/security/operations/clearing/CancelClearingOperationByPartitionRequest";
import ReclaimClearingOperationByPartitionRequest from "@port/in/request/security/operations/clearing/ReclaimClearingOperationByPartitionRequest";
import ClearingRedeemByPartitionRequest from "@port/in/request/security/operations/clearing/ClearingRedeemByPartitionRequest";
import ClearingRedeemFromByPartitionRequest from "@port/in/request/security/operations/clearing/ClearingRedeemFromByPartitionRequest";
import ProtectedClearingRedeemByPartitionRequest from "@port/in/request/security/operations/clearing/ProtectedClearingRedeemByPartitionRequest";
import ClearingCreateHoldByPartitionRequest from "@port/in/request/security/operations/clearing/ClearingCreateHoldByPartitionRequest";
import ClearingCreateHoldFromByPartitionRequest from "@port/in/request/security/operations/clearing/ClearingCreateHoldFromByPartitionRequest";
import ProtectedClearingCreateHoldByPartitionRequest from "@port/in/request/security/operations/clearing/ProtectedClearingCreateHoldByPartitionRequest";
import GetClearedAmountForRequest from "@port/in/request/security/operations/clearing/GetClearedAmountForRequest";
import GetClearedAmountForByPartitionRequest from "@port/in/request/security/operations/clearing/GetClearedAmountForByPartitionRequest";
import GetClearingCountForByPartitionRequest from "@port/in/request/security/operations/clearing/GetClearingCountForByPartitionRequest";
import GetClearingCreateHoldForByPartitionRequest from "@port/in/request/security/operations/clearing/GetClearingCreateHoldForByPartitionRequest";
import GetClearingRedeemForByPartitionRequest from "@port/in/request/security/operations/clearing/GetClearingRedeemForByPartitionRequest";
import GetClearingTransferForByPartitionRequest from "@port/in/request/security/operations/clearing/GetClearingTransferForByPartitionRequest";
import GetClearingsIdForByPartitionRequest from "@port/in/request/security/operations/clearing/GetClearingsIdForByPartitionRequest";
import IsClearingActivatedRequest from "@port/in/request/security/operations/clearing/IsClearingActivatedRequest";
import OperatorClearingCreateHoldByPartitionRequest from "@port/in/request/security/operations/clearing/OperatorClearingCreateHoldByPartitionRequest";
import OperatorClearingRedeemByPartitionRequest from "@port/in/request/security/operations/clearing/OperatorClearingRedeemByPartitionRequest";
import OperatorClearingTransferByPartitionRequest from "@port/in/request/security/operations/clearing/OperatorClearingTransferByPartitionRequest";

import BigDecimal from "@domain/context/shared/BigDecimal";
import { GetClearingRedeemForByPartitionQuery } from "@query/security/clearing/getClearingRedeemForByPartition/GetClearingRedeemForByPartitionQuery";
import { GetClearingsIdForByPartitionQuery } from "@query/security/clearing/getClearingsIdForByPartition/GetClearingsIdForByPartitionQuery";
import { GetClearingTransferForByPartitionQuery } from "@query/security/clearing/getClearingTransferForByPartition/GetClearingTransferForByPartitionQuery";
import { IsClearingActivatedQuery } from "@query/security/clearing/isClearingActivated/IsClearingActivatedQuery";
import { ActivateClearingCommand } from "@command/security/operations/clearing/activateClearing/ActivateClearingCommand";
import { ApproveClearingOperationByPartitionCommand } from "@command/security/operations/clearing/approveClearingOperationByPartition/ApproveClearingOperationByPartitionCommand";
import { DeactivateClearingCommand } from "@command/security/operations/clearing/deactivateClearing/DeactivateClearingCommand";
import { ProtectedClearingCreateHoldByPartitionCommand } from "@command/security/operations/clearing/protectedClearingCreateHoldByPartition/ProtectedClearingCreateHoldByPartitionCommand";
import { ProtectedClearingRedeemByPartitionCommand } from "@command/security/operations/clearing/protectedClearingRedeemByPartition/ProtectedClearingRedeemByPartitionCommand";
import { ProtectedClearingTransferByPartitionCommand } from "@command/security/operations/clearing/protectedClearingTransferByPartition/ProtectedClearingTransferByPartitionCommand";

export const ActivateClearingRequestFixture = createFixture<ActivateClearingRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const DeactivateClearingRequestFixture = createFixture<DeactivateClearingRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const ClearingTransferByPartitionRequestFixture = createFixture<ClearingTransferByPartitionRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.targetId.as(() => HederaIdPropsFixture.create().value);
    request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
    request.expirationDate.faker((faker) => faker.date.future().getTime().toString());
  },
);

export const ClearingTransferFromByPartitionRequestFixture = createFixture<ClearingTransferFromByPartitionRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.targetId.as(() => HederaIdPropsFixture.create().value);
    request.sourceId.as(() => HederaIdPropsFixture.create().value);
    request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
    request.expirationDate.faker((faker) => faker.date.future().getTime().toString());
  },
);

export const ProtectedClearingTransferByPartitionRequestFixture =
  createFixture<ProtectedClearingTransferByPartitionRequest>((request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.sourceId.as(() => HederaIdPropsFixture.create().value);
    request.targetId.as(() => HederaIdPropsFixture.create().value);
    request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
    request.expirationDate.faker((faker) => faker.date.future().getTime().toString());
    request.deadline.faker((faker) => faker.date.future().getTime().toString());
    request.nonce.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
    request.signature.faker((faker) => faker.string.hexadecimal({ length: 64, prefix: "0x" }));
  });

export const ApproveClearingOperationByPartitionRequestFixture =
  createFixture<ApproveClearingOperationByPartitionRequest>((request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.targetId.as(() => HederaIdPropsFixture.create().value);
    request.clearingId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
    request.clearingOperationType?.faker(() => Object.values(ClearingOperationType));
  });

export const CancelClearingOperationByPartitionRequestFixture =
  createFixture<CancelClearingOperationByPartitionRequest>((request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.targetId.as(() => HederaIdPropsFixture.create().value);
    request.clearingId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
    request.clearingOperationType?.faker(() => Object.values(ClearingOperationType));
  });

export const ReclaimClearingOperationByPartitionRequestFixture =
  createFixture<ReclaimClearingOperationByPartitionRequest>((request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.targetId.as(() => HederaIdPropsFixture.create().value);
    request.clearingId.faker((faker) => faker.number.int({ min: 1, max: 10 }));
    request.clearingOperationType?.faker(() => Object.values(ClearingOperationType));
  });

export const ClearingRedeemByPartitionRequestFixture = createFixture<ClearingRedeemByPartitionRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.partitionId.as(() => PartitionIdFixture.create().value);
  request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
  request.expirationDate.faker((faker) => faker.date.future().getTime().toString());
});

export const ClearingRedeemFromByPartitionRequestFixture = createFixture<ClearingRedeemFromByPartitionRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.sourceId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
    request.expirationDate.faker((faker) => faker.date.future().getTime().toString());
  },
);

export const ProtectedClearingRedeemByPartitionRequestFixture =
  createFixture<ProtectedClearingRedeemByPartitionRequest>((request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.sourceId.as(() => HederaIdPropsFixture.create().value);
    request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
    request.expirationDate.faker((faker) => faker.date.future().getTime().toString());
    request.deadline.faker((faker) => faker.date.future().getTime().toString());
    request.nonce.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
    request.signature.faker((faker) => faker.string.hexadecimal({ length: 64, prefix: "0x" }));
  });

export const ClearingCreateHoldByPartitionRequestFixture = createFixture<ClearingCreateHoldByPartitionRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.escrowId.as(() => HederaIdPropsFixture.create().value);
    request.targetId.as(() => HederaIdPropsFixture.create().value);
    request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
    request.clearingExpirationDate.faker((faker) => faker.date.recent().getTime().toString());
    request.holdExpirationDate.faker((faker) => faker.date.future().getTime().toString());
  },
);

export const ClearingCreateHoldFromByPartitionRequestFixture = createFixture<ClearingCreateHoldFromByPartitionRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.escrowId.as(() => HederaIdPropsFixture.create().value);
    request.sourceId.as(() => HederaIdPropsFixture.create().value);
    request.targetId.as(() => HederaIdPropsFixture.create().value);
    request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
    request.clearingExpirationDate.faker((faker) => faker.date.recent().getTime().toString());
    request.holdExpirationDate.faker((faker) => faker.date.future().getTime().toString());
  },
);

export const ProtectedClearingCreateHoldByPartitionRequestFixture =
  createFixture<ProtectedClearingCreateHoldByPartitionRequest>((request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.escrowId.as(() => HederaIdPropsFixture.create().value);
    request.sourceId.as(() => HederaIdPropsFixture.create().value);
    request.targetId.as(() => HederaIdPropsFixture.create().value);
    request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
    request.clearingExpirationDate.faker((faker) => faker.date.recent().getTime().toString());
    request.holdExpirationDate.faker((faker) => faker.date.future().getTime().toString());
    request.deadline.faker((faker) => faker.date.future().getTime().toString());
    request.nonce.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
    request.signature.faker((faker) => faker.string.hexadecimal({ length: 64, prefix: "0x" }));
  });

export const GetClearedAmountForRequestFixture = createFixture<GetClearedAmountForRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const GetClearedAmountForByPartitionRequestFixture = createFixture<GetClearedAmountForByPartitionRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.targetId.as(() => HederaIdPropsFixture.create().value);
  },
);

export const GetClearingCountForByPartitionRequestFixture = createFixture<GetClearingCountForByPartitionRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.targetId.as(() => HederaIdPropsFixture.create().value);
    request.clearingOperationType?.faker(() => Object.values(ClearingOperationType));
  },
);

export const GetClearingCreateHoldForByPartitionRequestFixture =
  createFixture<GetClearingCreateHoldForByPartitionRequest>((request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.targetId.as(() => HederaIdPropsFixture.create().value);
    request.clearingId.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
  });

export const GetClearingRedeemForByPartitionRequestFixture = createFixture<GetClearingRedeemForByPartitionRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.targetId.as(() => HederaIdPropsFixture.create().value);
    request.clearingId.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
  },
);

export const GetClearingTransferForByPartitionRequestFixture = createFixture<GetClearingTransferForByPartitionRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.targetId.as(() => HederaIdPropsFixture.create().value);
    request.clearingId.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
  },
);

export const GetClearingsIdForByPartitionRequestFixture = createFixture<GetClearingsIdForByPartitionRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.targetId.as(() => HederaIdPropsFixture.create().value);
    request.start.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
    request.end.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
    request.clearingOperationType?.faker(() => Object.values(ClearingOperationType));
  },
);

export const IsClearingActivatedRequestFixture = createFixture<IsClearingActivatedRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const OperatorClearingCreateHoldByPartitionRequestFixture =
  createFixture<OperatorClearingCreateHoldByPartitionRequest>((request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.escrowId.as(() => HederaIdPropsFixture.create().value);
    request.sourceId.as(() => HederaIdPropsFixture.create().value);
    request.targetId.as(() => HederaIdPropsFixture.create().value);
    request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
    request.clearingExpirationDate.faker((faker) => faker.date.recent().getTime().toString());
    request.holdExpirationDate.faker((faker) => faker.date.future().getTime().toString());
  });

export const OperatorClearingRedeemByPartitionRequestFixture = createFixture<OperatorClearingRedeemByPartitionRequest>(
  (request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.sourceId.as(() => HederaIdPropsFixture.create().value);
    request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
    request.expirationDate.faker((faker) => faker.date.future().getTime().toString());
  },
);

export const OperatorClearingTransferByPartitionRequestFixture =
  createFixture<OperatorClearingTransferByPartitionRequest>((request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.partitionId.as(() => PartitionIdFixture.create().value);
    request.sourceId.as(() => HederaIdPropsFixture.create().value);
    request.targetId.as(() => HederaIdPropsFixture.create().value);
    request.amount.faker((faker) => faker.number.int({ min: 1, max: 10 }).toString());
    request.expirationDate.faker((faker) => faker.date.future().getTime().toString());
  });

export const GetClearedAmountForQueryFixture = createFixture<GetClearedAmountForQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
});

export const GetClearedAmountForByPartitionQueryFixture = createFixture<GetClearedAmountForByPartitionQuery>(
  (query) => {
    query.securityId.as(() => HederaIdPropsFixture.create().value);
    query.partitionId.as(() => PartitionIdFixture.create().value);
    query.targetId.as(() => HederaIdPropsFixture.create().value);
  },
);

export const GetClearingCountForByPartitionQueryFixture = createFixture<GetClearingCountForByPartitionQuery>(
  (query) => {
    query.securityId.as(() => HederaIdPropsFixture.create().value);
    query.partitionId.as(() => PartitionIdFixture.create().value);
    query.targetId.as(() => HederaIdPropsFixture.create().value);
    query.clearingOperationType.faker((faker) => faker.helpers.arrayElement(Object.values(ClearingOperationType)));
  },
);

export const IsClearingActivatedQueryFixture = createFixture<IsClearingActivatedQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
});

export const GetClearingCreateHoldForByPartitionQueryFixture = createFixture<GetClearingCreateHoldForByPartitionQuery>(
  (query) => {
    query.securityId.as(() => HederaIdPropsFixture.create().value);
    query.partitionId.as(() => PartitionIdFixture.create().value);
    query.targetId.as(() => HederaIdPropsFixture.create().value);
    query.clearingId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  },
);

export const GetClearingTransferForByPartitionQueryFixture = createFixture<GetClearingTransferForByPartitionQuery>(
  (query) => {
    query.securityId.as(() => HederaIdPropsFixture.create().value);
    query.partitionId.as(() => PartitionIdFixture.create().value);
    query.targetId.as(() => HederaIdPropsFixture.create().value);
    query.clearingId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  },
);

export const GetClearingRedeemForByPartitionQueryFixture = createFixture<GetClearingRedeemForByPartitionQuery>(
  (query) => {
    query.securityId.as(() => HederaIdPropsFixture.create().value);
    query.partitionId.as(() => PartitionIdFixture.create().value);
    query.targetId.as(() => HederaIdPropsFixture.create().value);
    query.clearingId.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  },
);

export const GetClearingsIdForByPartitionQueryFixture = createFixture<GetClearingsIdForByPartitionQuery>((query) => {
  query.securityId.as(() => HederaIdPropsFixture.create().value);
  query.partitionId.as(() => PartitionIdFixture.create().value);
  query.targetId.as(() => HederaIdPropsFixture.create().value);
  query.clearingOperationType.faker((faker) => faker.helpers.arrayElement(Object.values(ClearingOperationType)));
  query.start.faker((faker) => faker.number.int({ min: 1, max: 999 }));
  query.end.faker((faker) => faker.number.int({ min: 1, max: 999 }));
});

export const SwitchClearingModeCommandFixture = createFixture<ActivateClearingCommand | DeactivateClearingCommand>(
  (command) => {
    command.securityId.as(() => HederaIdPropsFixture.create().value);
  },
);

export const HandleClearingOperationByPartitionCommandFixture =
  createFixture<ApproveClearingOperationByPartitionCommand>((command) => {
    command.securityId.as(() => HederaIdPropsFixture.create().value);
    command.partitionId.as(() => PartitionIdFixture.create().value);
    command.targetId.as(() => HederaIdPropsFixture.create().value);
    command.clearingId.faker((faker) => faker.number.int({ min: 0, max: 1000 }));
    command.clearingOperationType.faker((faker) => {
      const values = Object.values(ClearingOperationType).filter((v) => typeof v === "number") as number[];
      return faker.helpers.arrayElement(values);
    });
  });

export const ClearingCreateHoldByPartitionCommandFixture = createFixture<ProtectedClearingCreateHoldByPartitionCommand>(
  (command) => {
    command.securityId.as(() => HederaIdPropsFixture.create().value);
    command.partitionId.as(() => PartitionIdFixture.create().value);
    command.targetId.as(() => HederaIdPropsFixture.create().value);
    command.escrowId.as(() => HederaIdPropsFixture.create().value);
    command.amount.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
    let clearingExpirationDate: Date;
    command.clearingExpirationDate.faker((faker) => {
      clearingExpirationDate = faker.date.future();
      return clearingExpirationDate.getTime().toString();
    });
    command.holdExpirationDate.faker((faker) => faker.date.future().getTime().toString());
    command.sourceId.as(() => HederaIdPropsFixture.create().value);
    command.deadline.faker((faker) => faker.date.future().getTime().toString());
    command.nonce.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
    command.signature.faker((faker) => faker.string.hexadecimal({ length: 64, prefix: "0x" }));
  },
);

export const ClearingRedeemByPartitionCommandFixture = createFixture<ProtectedClearingRedeemByPartitionCommand>(
  (command) => {
    command.securityId.as(() => HederaIdPropsFixture.create().value);
    command.partitionId.as(() => PartitionIdFixture.create().value);
    command.amount.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
    command.amount.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
    command.expirationDate.faker((faker) => faker.date.future().getTime().toString());
    command.sourceId.as(() => HederaIdPropsFixture.create().value);
    command.deadline.faker((faker) => faker.date.future().getTime().toString());
    command.nonce.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
    command.signature.faker((faker) => faker.string.hexadecimal({ length: 64, prefix: "0x" }));
  },
);

export const ClearingTransferByPartitionCommandFixture = createFixture<ProtectedClearingTransferByPartitionCommand>(
  (command) => {
    command.securityId.as(() => HederaIdPropsFixture.create().value);
    command.partitionId.as(() => PartitionIdFixture.create().value);
    command.amount.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
    command.amount.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
    command.expirationDate.faker((faker) => faker.date.future().getTime().toString());
    command.sourceId.as(() => HederaIdPropsFixture.create().value);
    command.targetId.as(() => HederaIdPropsFixture.create().value);
    command.deadline.faker((faker) => faker.date.future().getTime().toString());
    command.nonce.faker((faker) => faker.number.int({ min: 0, max: 1000 }).toString());
    command.signature.faker((faker) => faker.string.hexadecimal({ length: 64, prefix: "0x" }));
  },
);

export const ClearingHoldCreationFixture = createFixture<ClearingHoldCreation>((props) => {
  props.amount.faker((faker) => BigInt(faker.number.int({ max: 999 })).toString());
  props.expirationTimestamp.faker((faker) => faker.date.future());
  props.data.faker((faker) => faker.lorem.words());
  props.operatorData.faker((faker) => faker.lorem.words());
  props.holdEscrowId.as(() => HederaIdPropsFixture.create().value);
  props.holdExpirationTimestamp.faker((faker) => faker.date.future());
  props.holdTo.as(() => HederaIdPropsFixture.create().value);
  props.holdData.faker((faker) => faker.lorem.words());
});

export const ClearingRedeemFixture = createFixture<ClearingRedeem>((props) => {
  props.amount.faker((faker) => BigInt(faker.number.int({ max: 999 })).toString());
  props.expirationTimestamp.faker((faker) => faker.date.future());
  props.data.faker((faker) => faker.lorem.words());
  props.operatorData.faker((faker) => faker.lorem.words());
});

export const ClearingTransferFixture = createFixture<ClearingTransfer>((props) => {
  props.amount.faker((faker) => BigInt(faker.number.int({ max: 999 })).toString());
  props.expirationTimestamp.faker((faker) => faker.date.future());
  props.data.faker((faker) => faker.lorem.words());
  props.operatorData.faker((faker) => faker.lorem.words());
  props.destination.as(() => HederaIdPropsFixture.create().value);
});
