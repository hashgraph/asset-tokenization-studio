// SPDX-License-Identifier: Apache-2.0

import BaseError, { ErrorCode } from "@core/error/BaseError";
import { SupportedWallets } from "../Wallet";

export class WalletConnectRejectedError extends BaseError {
  constructor(wallet: SupportedWallets) {
    super(ErrorCode.PairingRejected, `The user rejected the pair request for: ${wallet}`);
    Object.setPrototypeOf(this, WalletConnectRejectedError.prototype);
  }
}
