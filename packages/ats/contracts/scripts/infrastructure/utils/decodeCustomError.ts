// SPDX-License-Identifier: Apache-2.0

import { BaseContract } from "ethers";

export async function decodeCustomError<T extends BaseContract>(
  contract: T,
  errorName: string,
  error: unknown,
): Promise<Record<string, unknown>> {
  const errorFragment = contract.interface.getError(errorName);
  if (!errorFragment) {
    throw new Error(`Error "${errorName}" doesn't exist in the contract`);
  }

  const revertData = (error as { data?: string }).data;
  if (!revertData) {
    throw new Error("No revert data available in caught error");
  }

  const decodedArgs = contract.interface.decodeErrorResult(errorFragment, revertData);
  return decodedArgs.toObject();
}
