// SPDX-License-Identifier: Apache-2.0

import { ActivateClearingCommandHandler } from "@command/security/operations/clearing/activateClearing/ActivateClearingCommandHandler";
import { TOKENS } from "../Tokens";
import { DeactivateClearingCommandHandler } from "@command/security/operations/clearing/deactivateClearing/DeactivateClearingCommandHandler";
import { ClearingTransferByPartitionCommandHandler } from "@command/security/operations/clearing/clearingTransferByPartition/ClearingTransferByPartitionCommandHandler";
import { ClearingTransferFromByPartitionCommandHandler } from "@command/security/operations/clearing/clearingTransferFromByPartition/ClearingTransferFromByPartitionCommandHandler";
import { ProtectedClearingTransferByPartitionCommandHandler } from "@command/security/operations/clearing/protectedClearingTransferByPartition/ProtectedClearingTransferByPartitionCommandHandler";
import { ApproveClearingOperationByPartitionCommandHandler } from "@command/security/operations/clearing/approveClearingOperationByPartition/ApproveClearingOperationByPartitionCommandHandler";
import { CancelClearingOperationByPartitionCommandHandler } from "@command/security/operations/clearing/cancelClearingOperationByPartition/CancelClearingOperationByPartitionCommandHandler";
import { ReclaimClearingOperationByPartitionCommandHandler } from "@command/security/operations/clearing/reclaimClearingOperationByPartition/ReclaimClearingOperationByPartitionCommandHandler";
import { ClearingRedeemByPartitionCommandHandler } from "@command/security/operations/clearing/clearingRedeemByPartition/ClearingRedeemByPartitionCommandHandler";
import { ClearingRedeemFromByPartitionCommandHandler } from "@command/security/operations/clearing/clearingRedeemFromByPartition/ClearingRedeemFromByPartitionCommandHandler";
import { ProtectedClearingRedeemByPartitionCommandHandler } from "@command/security/operations/clearing/protectedClearingRedeemByPartition/ProtectedClearingRedeemByPartitionCommandHandler";
import { ClearingCreateHoldByPartitionCommandHandler } from "@command/security/operations/clearing/clearingCreateHoldByPartition/ClearingCreateHoldByPartitionCommandHandler";
import { ClearingCreateHoldFromByPartitionCommandHandler } from "@command/security/operations/clearing/clearingCreateHoldFromByPartition/ClearingCreateHoldFromByPartitionCommandHandler";
import { ProtectedClearingCreateHoldByPartitionCommandHandler } from "@command/security/operations/clearing/protectedClearingCreateHoldByPartition/ProtectedClearingCreateHoldByPartitionCommandHandler";
import { OperatorClearingCreateHoldByPartitionCommandHandler } from "@command/security/operations/clearing/operatorClearingCreateHoldByPartition/OperatorClearingCreateHoldByPartitionCommandHandler";
import { OperatorClearingRedeemByPartitionCommandHandler } from "@command/security/operations/clearing/operatorClearingRedeemByPartition/OperatorClearingRedeemByPartitionCommandHandler";
import { OperatorClearingTransferByPartitionCommandHandler } from "@command/security/operations/clearing/operatorClearingTransferByPartition/OperatorClearingTransferByPartitionCommandHandler";
import { GetClearedAmountForQueryHandler } from "@query/security/clearing/getClearedAmountFor/GetClearedAmountForQueryHandler";
import { GetClearedAmountForByPartitionQueryHandler } from "@query/security/clearing/getClearedAmountForByPartition/GetClearedAmountForByPartitionQueryHandler";
import { GetClearingCountForByPartitionQueryHandler } from "@query/security/clearing/getClearingCountForByPartition/GetClearingCountForByPartitionQueryHandler";
import { GetClearingCreateHoldForByPartitionQueryHandler } from "@query/security/clearing/getClearingCreateHoldForByPartition/GetClearingCreateHoldForByPartitionQueryHandler";
import { GetClearingTransferForByPartitionQueryHandler } from "@query/security/clearing/getClearingTransferForByPartition/GetClearingTransferForByPartitionQueryHandler";
import { GetClearingRedeemForByPartitionQueryHandler } from "@query/security/clearing/getClearingRedeemForByPartition/GetClearingRedeemForByPartitionQueryHandler";
import { GetClearingsIdForByPartitionQueryHandler } from "@query/security/clearing/getClearingsIdForByPartition/GetClearingsIdForByPartitionQueryHandler";
import { IsClearingActivatedQueryHandler } from "@query/security/clearing/isClearingActivated/IsClearingActivatedQueryHandler";

export const COMMAND_HANDLERS_CLEARING = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ActivateClearingCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: DeactivateClearingCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ClearingTransferByPartitionCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ClearingTransferFromByPartitionCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ProtectedClearingTransferByPartitionCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ApproveClearingOperationByPartitionCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: CancelClearingOperationByPartitionCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ReclaimClearingOperationByPartitionCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ClearingRedeemByPartitionCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ClearingRedeemFromByPartitionCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ProtectedClearingRedeemByPartitionCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ClearingCreateHoldByPartitionCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ClearingCreateHoldFromByPartitionCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ProtectedClearingCreateHoldByPartitionCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: OperatorClearingCreateHoldByPartitionCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: OperatorClearingRedeemByPartitionCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: OperatorClearingTransferByPartitionCommandHandler,
  },
];

export const QUERY_HANDLERS_CLEARING = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetClearedAmountForQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetClearedAmountForByPartitionQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetClearingCountForByPartitionQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetClearingCreateHoldForByPartitionQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetClearingTransferForByPartitionQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetClearingRedeemForByPartitionQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: GetClearingsIdForByPartitionQueryHandler,
  },
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: IsClearingActivatedQueryHandler,
  },
];
