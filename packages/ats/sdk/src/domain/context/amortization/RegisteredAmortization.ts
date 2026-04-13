// SPDX-License-Identifier: Apache-2.0

import { Amortization } from "./Amortization";

export class RegisteredAmortization {
  amortization: Amortization;
  snapshotId: number;
  isDisabled: boolean;

  constructor(amortization: Amortization, snapshotId: number, isDisabled: boolean) {
    this.amortization = amortization;
    this.snapshotId = snapshotId;
    this.isDisabled = isDisabled;
  }
}
