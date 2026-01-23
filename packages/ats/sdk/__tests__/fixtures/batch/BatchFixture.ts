// SPDX-License-Identifier: Apache-2.0

import { createFixture } from "../config";
import { HederaIdPropsFixture } from "../shared/DataFixture";
import { BigNumber } from "ethers";

import { BatchTransferCommand } from "@command/security/operations/batch/batchTransfer/BatchTransferCommand";
import { BatchBurnCommand } from "@command/security/operations/batch/batchBurn/BatchBurnCommand";
import { BatchForcedTransferCommand } from "@command/security/operations/batch/batchForcedTransfer/BatchForcedTransferCommand";
import { BatchFreezePartialTokensCommand } from "@command/security/operations/batch/batchFreezePartialTokens/BatchFreezePartialTokensCommand";
import { BatchMintCommand } from "@command/security/operations/batch/batchMint/BatchMintCommand";
import { BatchSetAddressFrozenCommand } from "@command/security/operations/batch/batchSetAddressFrozen/BatchSetAddressFrozenCommand";
import { BatchUnfreezePartialTokensCommand } from "@command/security/operations/batch/batchUnfreezePartialTokens/BatchUnfreezePartialTokensCommand";
import {
  BatchTransferRequest,
  BatchForcedTransferRequest,
  BatchMintRequest,
  BatchBurnRequest,
  BatchSetAddressFrozenRequest,
  BatchFreezePartialTokensRequest,
  BatchUnfreezePartialTokensRequest,
} from "src";

export const BatchTransferRequestFixture = createFixture<BatchTransferRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.amountList.as(() => [BigNumber.from(1)]);
  request.toList.as(() => [HederaIdPropsFixture.create().value]);
});

export const BatchForcedTransferRequestFixture = createFixture<BatchForcedTransferRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.amountList.as(() => [BigNumber.from(1)]);
  request.toList.as(() => [HederaIdPropsFixture.create().value]);
  request.fromList.as(() => [HederaIdPropsFixture.create().value]);
});
export const BatchMintRequestFixture = createFixture<BatchMintRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.amountList.as(() => [BigNumber.from(1)]);
  request.toList.as(() => [HederaIdPropsFixture.create().value]);
});
export const BatchBurnRequestFixture = createFixture<BatchBurnRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetList.as(() => [HederaIdPropsFixture.create().value]);
  request.amountList.as(() => [BigNumber.from(1)]);
});
export const BatchSetAddressFrozenRequestFixture = createFixture<BatchSetAddressFrozenRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.targetList.as(() => [HederaIdPropsFixture.create().value]);
  request.freezeList.as(() => [true]);
});
export const BatchFreezePartialTokensRequestFixture = createFixture<BatchFreezePartialTokensRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.amountList.as(() => [BigNumber.from(1)]);
  request.targetList.as(() => [HederaIdPropsFixture.create().value]);
});

export const BatchUnfreezePartialTokensRequestFixture = createFixture<BatchUnfreezePartialTokensRequest>((request) => {
  request.securityId.as(() => HederaIdPropsFixture.create().value);
  request.amountList.as(() => [BigNumber.from(1)]);
  request.targetList.as(() => [HederaIdPropsFixture.create().value]);
});

export const BatchTransferCommandFixture = createFixture<BatchTransferCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.amountList.as(() => [BigNumber.from(1)]);
  command.toList.as(() => [HederaIdPropsFixture.create().value]);
});

export const BatchMintCommandFixture = createFixture<BatchMintCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.amountList.as(() => [BigNumber.from(1)]);
  command.toList.as(() => [HederaIdPropsFixture.create().value]);
});

export const BatchBurnCommandFixture = createFixture<BatchBurnCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.amountList.as(() => [BigNumber.from(1)]);
  command.targetList.as(() => [HederaIdPropsFixture.create().value]);
});

export const BatchSetAddressFrozenCommandFixture = createFixture<BatchSetAddressFrozenCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.freezeStatusList.as(() => [HederaIdPropsFixture.create().value]);
  command.targetList.as(() => [HederaIdPropsFixture.create().value]);
});

export const BatchFreezePartialTokensCommandFixture = createFixture<BatchFreezePartialTokensCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.amountList.as(() => [BigNumber.from(1)]);
  command.targetList.as(() => [HederaIdPropsFixture.create().value]);
});

export const BatchForcedTransferCommandFixture = createFixture<BatchForcedTransferCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.amountList.as(() => [BigNumber.from(1)]);
  command.fromList.as(() => [HederaIdPropsFixture.create().value]);
  command.toList.as(() => [HederaIdPropsFixture.create().value]);
});

export const BatchUnfreezePartialTokensCommandFixture = createFixture<BatchUnfreezePartialTokensCommand>((command) => {
  command.securityId.as(() => HederaIdPropsFixture.create().value);
  command.amountList.as(() => [BigNumber.from(1)]);
  command.targetList.as(() => [HederaIdPropsFixture.create().value]);
});
