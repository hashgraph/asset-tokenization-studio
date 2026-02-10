// SPDX-License-Identifier: Apache-2.0

import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
// For Ethers v5, EventFragment helps us with typing if we need it.
// You can import it from 'ethers/lib/utils' or '@ethersproject/abi' depending on your setup.
// If hre.ethers is already v5, you don't need this explicit import for EventFragment
// unless you want stricter typing.
import { FunctionFragment } from "@ethersproject/abi"; // Or 'ethers/lib/utils'
import { id } from "ethers/lib/utils";

task("list-events-v5", "Shows event names and selectors (topic hash) for Ethers v5").setAction(
  async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    console.log("Getting event signatures (Ethers v5)...");

    // Ensure that ethers in HRE is v5.
    // This is a rudimentary check; the exact version may vary (e.g., 5.7.2).

    const allContractEvents: {
      [contractName: string]: { name: string; selector: string }[];
    } = {};

    const contractNames = await hre.artifacts.getAllFullyQualifiedNames();
    console.log("contractNames");
    console.log(contractNames);
    for (const qualifiedName of contractNames) {
      try {
        const artifact = await hre.artifacts.readArtifact(qualifiedName);
        const contractName = artifact.contractName;

        if (!artifact.abi || artifact.abi.length === 0) {
          // console.log(`Skipping ${contractName} (no ABI or empty ABI)`);
          continue;
        }

        // In Ethers v5, we create the Interface instance like this:
        const contractInterface = new hre.ethers.utils.Interface(artifact.abi);

        const eventsData = [];

        for (const fragment of contractInterface.fragments) {
          if (fragment.type === "function") {
            // Cast to FunctionFragment for better autocomplete and type safety
            const functionFragment = fragment as FunctionFragment;
            const functionName = functionFragment.name;

            // In Ethers v5, we use getSighash to get the function selector
            const functionSelector = contractInterface.getSighash(functionFragment);

            eventsData.push({
              name: functionName,
              selector: functionSelector,
            });
          }
        }

        if (eventsData.length > 0) {
          // You might want to store by qualifiedName if you have contractName collisions
          allContractEvents[contractName] = eventsData;
        }
      } catch (error) {
        console.warn(`Could not process ${qualifiedName}: ${(error as Error).message}`);
      }
    }

    if (Object.keys(allContractEvents).length === 0) {
      console.log("No events found in any contract.");
    } else {
      // Print the JSON
      console.log(JSON.stringify(allContractEvents, null, 2));

      // If you prefer a flat object { 'EventName(params)': 'selector', ... }
      // (this can have collisions if different contracts have the same event)
      /*
      const flatEventMap: { [signature: string]: string } = {};
      for (const contractName in allContractEvents) {
        allContractEvents[contractName].forEach(event => {
          // To get a more complete signature like 'sighash' in ethers v6
          // we need to rebuild it a bit or use the complete fragment.
          // For now, just name and simple selector.
          // const fullSignature = `${event.name}(${(contractInterface.getEvent(event.name).inputs.map(i => i.type)).join(',')})`;
          // flatEventMap[`${contractName}.${event.name}`] = event.selector; // Avoid collisions
          flatEventMap[event.name] = event.selector; // Simple, may have collisions
        });
      }
      console.log("Events as flat object (name: selector):");
      console.log(JSON.stringify(flatEventMap, null, 2));
      */
    }
  },
);

task("list-functions-v5", "Shows function names and selectors (topic hash) for Ethers v5").setAction(
  async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    console.log("Getting function signatures (Ethers v5)...");

    // Ensure that ethers in HRE is v5.
    // This is a rudimentary check; the exact version may vary (e.g., 5.7.2).

    const allContractEvents: {
      [contractName: string]: { name: string; selector: string }[];
    } = {};

    const contractNames = await hre.artifacts.getAllFullyQualifiedNames();
    console.log("contractNames");
    console.log(contractNames);
    for (const qualifiedName of contractNames) {
      try {
        const artifact = await hre.artifacts.readArtifact(qualifiedName);
        const contractName = artifact.contractName;

        if (!artifact.abi || artifact.abi.length === 0) {
          // console.log(`Skipping ${contractName} (no ABI or empty ABI)`);
          continue;
        }

        // In Ethers v5, we create the Interface instance like this:
        const contractInterface = new hre.ethers.utils.Interface(artifact.abi);

        const eventsData = [];

        for (const fragment of contractInterface.fragments) {
          if (fragment.type === "function") {
            // Cast to EventFragment for better autocomplete and type safety
            const functionFragment = fragment as FunctionFragment;
            const functionName = functionFragment.name;

            // In Ethers v5, we use getEventTopic to get the event selector (topic hash)
            const functionSelector = id(functionFragment.format("sighash")).substring(0, 10);

            eventsData.push({
              name: functionName,
              selector: functionSelector,
            });
          }
        }

        if (eventsData.length > 0) {
          // You might want to store by qualifiedName if you have contractName collisions
          allContractEvents[contractName] = eventsData;
        }
      } catch (error) {
        console.warn(`Could not process ${qualifiedName}: ${(error as Error).message}`);
      }
    }

    if (Object.keys(allContractEvents).length === 0) {
      console.log("No events found in any contract.");
    } else {
      // Print the JSON
      console.log(JSON.stringify(allContractEvents, null, 2));

      // If you prefer a flat object { 'EventName(params)': 'selector', ... }
      // (this can have collisions if different contracts have the same event)
      /*
      const flatEventMap: { [signature: string]: string } = {};
      for (const contractName in allContractEvents) {
        allContractEvents[contractName].forEach(event => {
          // To get a more complete signature like 'sighash' in ethers v6
          // we need to rebuild it a bit or use the complete fragment.
          // For now, just name and simple selector.
          // const fullSignature = `${event.name}(${(contractInterface.getEvent(event.name).inputs.map(i => i.type)).join(',')})`;
          // flatEventMap[`${contractName}.${event.name}`] = event.selector; // Avoid collisions
          flatEventMap[event.name] = event.selector; // Simple, may have collisions
        });
      }
      console.log("Events as flat object (name: selector):");
      console.log(JSON.stringify(flatEventMap, null, 2));
      */
    }
  },
);
