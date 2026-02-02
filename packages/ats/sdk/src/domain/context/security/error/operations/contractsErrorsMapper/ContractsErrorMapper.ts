// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";
import { ClearingActivated } from "../ClearingActivated";
import { InsufficientAllowance } from "../InsufficientAllowance";
import { InvalidPartition } from "../InvalidPartition";
import { InsufficientBalance } from "../InsufficientBalance";
import { SecurityPaused } from "../SecurityPaused";
import { EIP1066_CODES } from "../codes";
import { ethers } from "ethers";
import { ZeroAddressNotAllowed } from "../ZeroAddressNotAllowed";
import { AccountBlocked } from "../AccountBlocked";
import { ComplianceNotAllowed } from "../ComplianceNotAllowed";
import { InvalidKycStatus } from "../InvalidKycStatus";
import { WalletRecovered } from "../WalletRecovered";
import { AddressNotVerified } from "../AddressNotVerified";

export class ContractsErrorMapper {
  static mapError(errorCode: string, reason: string): BaseError {
    const normalizedErrorCode = errorCode.toLowerCase();
    const normalizedReason = reason.toLowerCase().slice(0, 10);

    const combinedKey = `${normalizedErrorCode}:${normalizedReason}`;
    const errorFactory = this.ERROR_MAPPINGS.get(combinedKey) || this.ERROR_MAPPINGS.get(normalizedErrorCode);

    return (
      errorFactory?.() ||
      new BaseError(ErrorCode.Unexpected, `Unexpected error code: ${errorCode} with reason: ${reason}`)
    );
  }

  private static createSelector(signature: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(signature)).slice(0, 10);
  }

  private static readonly SELECTORS = {
    zeroAddressNotAllowed: this.createSelector("ZeroAddressNotAllowed()"),
    accountIsBlocked: this.createSelector("AccountIsBlocked(address)"),
    tokenIsPaused: this.createSelector("TokenIsPaused()"),
    clearingIsActivated: this.createSelector("ClearingIsActivated()"),
    complianceNotAllowed: this.createSelector("ComplianceNotAllowed()"),
    invalidKycStatus: this.createSelector("InvalidKycStatus()"),
    addressNotVerified: this.createSelector("AddressNotVerified()"),
    walletRecovered: this.createSelector("WalletRecovered()"),
    insufficientAllowance: this.createSelector("InsufficientAllowance(address,address)"),
    invalidPartition: this.createSelector("InvalidPartition(address,bytes32)"),
    insufficientBalance: this.createSelector("InsufficientBalance(address,uint256,uint256,bytes32)"),
  };

  private static readonly ERROR_MAPPINGS: Map<string, () => BaseError> = new Map([
    [`${EIP1066_CODES.PAUSED}:${ContractsErrorMapper.SELECTORS.tokenIsPaused}`, (): BaseError => new SecurityPaused()],
    [`${EIP1066_CODES.PAUSED}`, (): BaseError => new SecurityPaused()],
    [
      `${EIP1066_CODES.NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE}:${ContractsErrorMapper.SELECTORS.zeroAddressNotAllowed}`,
      (): BaseError => new ZeroAddressNotAllowed(),
    ],
    [
      `${EIP1066_CODES.NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE}:${ContractsErrorMapper.SELECTORS.accountIsBlocked}`,
      (): BaseError => new AccountBlocked(),
    ],
    [
      `${EIP1066_CODES.UNAVAILABLE}:${ContractsErrorMapper.SELECTORS.clearingIsActivated}`,
      (): BaseError => new ClearingActivated(),
    ],
    [
      `${EIP1066_CODES.DISALLOWED_OR_STOP}:${ContractsErrorMapper.SELECTORS.accountIsBlocked}`,
      (): BaseError => new AccountBlocked(),
    ],
    [
      `${EIP1066_CODES.DISALLOWED_OR_STOP}:${ContractsErrorMapper.SELECTORS.complianceNotAllowed}`,
      (): BaseError => new ComplianceNotAllowed(),
    ],
    [
      `${EIP1066_CODES.DISALLOWED_OR_STOP}:${ContractsErrorMapper.SELECTORS.invalidKycStatus}`,
      (): BaseError => new InvalidKycStatus(),
    ],
    [
      `${EIP1066_CODES.DISALLOWED_OR_STOP}:${ContractsErrorMapper.SELECTORS.addressNotVerified}`,
      (): BaseError => new AddressNotVerified(),
    ],
    [
      `${EIP1066_CODES.REVOKED_OR_BANNED}:${ContractsErrorMapper.SELECTORS.walletRecovered}`,
      (): BaseError => new WalletRecovered(),
    ],
    [
      `${EIP1066_CODES.INSUFFICIENT_FUNDS}:${ContractsErrorMapper.SELECTORS.insufficientAllowance}`,
      (): BaseError => new InsufficientAllowance(),
    ],
    [
      `${EIP1066_CODES.INSUFFICIENT_FUNDS}:${ContractsErrorMapper.SELECTORS.invalidPartition}`,
      (): BaseError => new InvalidPartition(),
    ],
    [
      `${EIP1066_CODES.INSUFFICIENT_FUNDS}:${ContractsErrorMapper.SELECTORS.insufficientBalance}`,
      (): BaseError => new InsufficientBalance(),
    ],
    [
      `${EIP1066_CODES.SUCCESS}`,
      (): BaseError => new BaseError(ErrorCode.Unexpected, "Unexpected success code in error context"),
    ],
  ]);
}
