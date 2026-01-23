// SPDX-License-Identifier: Apache-2.0
import { BigNumber } from "ethers";

export class ProtectionData {
  public deadline: BigNumber;
  public nounce: BigNumber;
  public signature: string;
}
