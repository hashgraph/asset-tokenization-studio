// SPDX-License-Identifier: Apache-2.0

export class EvmAddressNotFound extends Error {
  constructor() {
    super("EvmAddress not found in the mirror node");
  }
}
