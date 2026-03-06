// SPDX-License-Identifier: Apache-2.0

import { BaseContract, ContractTransactionReceipt } from "ethers";
import DeployContractWithFactoryResult from "./DeployContractWithFactoryResult";

export default class DeployContractResult extends DeployContractWithFactoryResult<BaseContract> {
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
    contract: BaseContract;
    proxyAddress?: string;
    proxyAdminAddress?: string;
    receipt?: ContractTransactionReceipt;
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
