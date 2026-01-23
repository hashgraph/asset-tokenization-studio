// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";

export class AccountNotKycd extends BaseError {
  constructor(account: string, kycStatus: number) {
    super(
      ErrorCode.AccountNotKycd,
      `Account ${account} does not have Kyc status: ${AccountNotKycd.getKycStatusLabel(kycStatus)} in the internal/external system`,
    );
  }

  private static getKycStatusLabel(kycStatus: number): string {
    switch (kycStatus) {
      case 1:
        return "Granted";
      case 0:
        return "Not Granted";
      default:
        return `Unknown (${kycStatus})`;
    }
  }
}
