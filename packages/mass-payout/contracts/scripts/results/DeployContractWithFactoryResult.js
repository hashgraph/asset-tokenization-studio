"use strict";
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", { value: true });
class DeployContractWithFactoryResult {
  address;
  contract;
  proxyAddress;
  proxyAdminAddress;
  receipt;
  constructor({ address, contract, proxyAddress, proxyAdminAddress, receipt }) {
    this.address = address;
    this.contract = contract;
    this.proxyAddress = proxyAddress;
    this.proxyAdminAddress = proxyAdminAddress;
    this.receipt = receipt;
  }
}
exports.default = DeployContractWithFactoryResult;
