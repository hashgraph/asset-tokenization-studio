// SPDX-License-Identifier: Apache-2.0

export class ReleaseAmortizationHoldCommandError extends Error {
  constructor(error: Error) {
    super(`An error occurred while releasing the amortization hold: ${error.message}`);
  }
}
