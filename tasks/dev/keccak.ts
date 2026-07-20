// SPDX-License-Identifier: Apache-2.0

import { task, types } from "hardhat/config";
import { keccak256 } from "ethers";

interface Keccak256Args {
  input: string;
}

task("keccak256", "Prints the keccak256 hash of a string")
  .addPositionalParam("input", "The string to be hashed", undefined, types.string)
  .setAction(async ({ input }: Keccak256Args) => {
    const hash = keccak256(Buffer.from(input, "utf-8"));
    console.log(`The keccak256 hash of the input "${input}" is: ${hash}`);
  });
