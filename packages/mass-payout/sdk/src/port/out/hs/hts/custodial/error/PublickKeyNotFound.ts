// SPDX-License-Identifier: Apache-2.0

export class PublickKeyNotFound extends Error {
  constructor() {
    super("PublicKey not found in the mirror node");
  }
}
