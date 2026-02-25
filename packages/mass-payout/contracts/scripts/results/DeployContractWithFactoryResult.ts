// SPDX-License-Identifier: Apache-2.0

import { BaseContract, ContractTransactionReceipt } from "ethers";

export default class DeployContractWithFactoryResult<C extends BaseContract> {
  public readonly address: string;
  public readonly contract: C;
  public readonly proxyAddress?: string;
  public readonly proxyAdminAddress?: string;
  public readonly receipt?: ContractTransactionReceipt;

  constructor({
    address,
    contract,
    proxyAddress,
    proxyAdminAddress,
    receipt,
  }: {
    address: string;
    contract: C;
    proxyAddress?: string;
    proxyAdminAddress?: string;
    receipt?: ContractTransactionReceipt;
  }) {
    this.address = address;
    this.contract = contract;
    this.proxyAddress = proxyAddress;
    this.proxyAdminAddress = proxyAdminAddress;
    this.receipt = receipt;
  }
}
