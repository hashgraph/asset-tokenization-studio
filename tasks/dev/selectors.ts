// SPDX-License-Identifier: Apache-2.0

import { task, types } from "hardhat/config";
import { EventFragment, FunctionFragment } from "ethers";

interface SelectorsArgs {
  contract?: string;
}

task("ats:selectors", "List function selectors and event topic hashes from compiled artifacts")
  .addOptionalPositionalParam(
    "contract",
    "Contract name to inspect (defaults to all contracts)",
    undefined,
    types.string,
  )
  .setAction(async (args: SelectorsArgs, hre) => {
    const result: {
      [contractName: string]: {
        functions: { name: string; selector: string }[];
        events: { name: string; topicHash: string }[];
      };
    } = {};

    const qualifiedNames = await hre.artifacts.getAllFullyQualifiedNames();
    for (const qualifiedName of qualifiedNames) {
      const artifact = await hre.artifacts.readArtifact(qualifiedName);
      if (args.contract && artifact.contractName !== args.contract) {
        continue;
      }
      if (!artifact.abi || artifact.abi.length === 0) {
        continue;
      }

      const iface = new hre.ethers.Interface(artifact.abi);
      const functions: { name: string; selector: string }[] = [];
      const events: { name: string; topicHash: string }[] = [];

      for (const fragment of iface.fragments) {
        if (fragment.type === "function") {
          const fn = fragment as FunctionFragment;
          functions.push({ name: fn.format("sighash"), selector: fn.selector });
        } else if (fragment.type === "event") {
          const ev = fragment as EventFragment;
          events.push({ name: ev.format("sighash"), topicHash: ev.topicHash });
        }
      }

      if (functions.length > 0 || events.length > 0) {
        result[artifact.contractName] = { functions, events };
      }
    }

    if (Object.keys(result).length === 0) {
      console.log(args.contract ? `No artifact found for contract '${args.contract}'` : "No contracts found.");
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
    return result;
  });
