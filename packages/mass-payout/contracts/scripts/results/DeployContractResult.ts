// SPDX-License-Identifier: Apache-2.0

import { Contract, ContractReceipt } from "ethers";
import DeployContractWithFactoryResult from "./DeployContractWithFactoryResult";

export default class DeployContractResult extends DeployContractWithFactoryResult<Contract> {
  public readonly name: string;

  constructor({
    name,
    address,
    contract,
    proxyAddress,
    proxyAdminAddress,
    receipt,
  }: {
    name: string;
    address: string;
    contract: Contract;
    proxyAddress?: string;
    proxyAdminAddress?: string;
    receipt?: ContractReceipt;
  }) {
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
