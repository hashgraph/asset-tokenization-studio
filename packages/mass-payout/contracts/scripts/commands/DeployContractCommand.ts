// SPDX-License-Identifier: Apache-2.0

import { Signer } from "ethers";

interface DeployContractCommandParams {
  name?: string;
  signer: Signer;
  args?: Array<unknown>;
}

export default class DeployContractCommand {
  public readonly name: string;
  public readonly signer: Signer;
  public readonly args: Array<unknown> = [];

  constructor({ name, signer, args = [] }: DeployContractCommandParams) {
    this.name = name;
    this.signer = signer;
    this.args = args;
  }
}
