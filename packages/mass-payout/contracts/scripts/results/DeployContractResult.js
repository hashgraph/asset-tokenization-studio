"use strict";
// SPDX-License-Identifier: Apache-2.0
Object.defineProperty(exports, "__esModule", { value: true });
const DeployContractWithFactoryResult_1 = require("./DeployContractWithFactoryResult");
class DeployContractResult extends DeployContractWithFactoryResult_1.default {
  name;
  constructor({ name, address, contract, proxyAddress, proxyAdminAddress, receipt }) {
    super({
      address,
      contract,
      proxyAddress,
      proxyAdminAddress,
      receipt,
    });
    this.name = name;
  }
}
exports.default = DeployContractResult;
