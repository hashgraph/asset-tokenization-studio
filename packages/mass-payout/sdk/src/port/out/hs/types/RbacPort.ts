// SPDX-License-Identifier: Apache-2.0

export default interface RbacPort {
  role: string; // bytes32 hex
  members: string[]; // EVM addresses
}
