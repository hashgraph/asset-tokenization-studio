// SPDX-License-Identifier: Apache-2.0

/**
 * Deploy tokens through a deployed Factory.
 *
 * This is *using* the system, not deploying it (that is Ignition's job), so the
 * token parameters are runtime data: they are read from a JSON file whose shape
 * mirrors the deploy*FromFactory params — see DEPLOYMENT.md for an example.
 */

import { task, types } from "hardhat/config";
import * as fs from "node:fs";
import * as path from "node:path";
import type {
  BondDetailsDataParams,
  EquityDetailsDataParams,
  FactoryRegulationDataParams,
  SecurityDataParams,
} from "@lib/domain";
import { GetSignerArgs, GetSignerResult } from "../lib/signer";

interface FactoryDeployArgs extends GetSignerArgs {
  params: string;
}

/** JSON file shape shared by both token deployment tasks. */
interface TokenParamsFile {
  /** Factory ResolverProxy address */
  factory: string;
  /** Defaults to the signer address when omitted */
  adminAccount?: string;
  securityData: SecurityDataParams;
  equityDetails?: EquityDetailsDataParams;
  bondDetails?: BondDetailsDataParams;
  proceedRecipients?: string[];
  proceedRecipientsData?: string[];
  regulation: FactoryRegulationDataParams;
}

function readParamsFile(paramsPath: string): TokenParamsFile {
  const resolved = path.resolve(process.cwd(), paramsPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Params file not found: ${resolved}`);
  }
  return JSON.parse(fs.readFileSync(resolved, "utf8")) as TokenParamsFile;
}

task("ats:factory:deploy-equity", "Deploy an equity token through a deployed Factory")
  .addParam(
    "params",
    "Path to a JSON file with factory, securityData, equityDetails and regulation",
    undefined,
    types.string,
  )
  .addOptionalParam("privateKey", "The private key of the account in raw hexadecimal format", undefined, types.string)
  .addOptionalParam(
    "signerAddress",
    "The address of the signer to select from the Hardhat signers array",
    undefined,
    types.string,
  )
  .addOptionalParam("signerPosition", "The index of the signer in the Hardhat signers array", undefined, types.int)
  .setAction(async (args: FactoryDeployArgs, hre) => {
    const { deployEquityFromFactory } = await import("@lib/domain");
    const { IFactory__factory } = await import("@contract-types");
    const { signer, address }: GetSignerResult = await hre.run("getSigner", {
      privateKey: args.privateKey,
      signerAddress: args.signerAddress,
      signerPosition: args.signerPosition,
    });

    const file = readParamsFile(args.params);
    if (!file.equityDetails) {
      throw new Error("Params file must include 'equityDetails' for an equity token");
    }

    const equity = await deployEquityFromFactory(
      {
        adminAccount: file.adminAccount ?? address,
        factory: IFactory__factory.connect(file.factory, signer),
        securityData: file.securityData,
        equityDetails: file.equityDetails,
      },
      file.regulation,
    );

    const equityAddress = await equity.getAddress();
    console.log(`Equity token deployed at ${equityAddress} (factory ${file.factory}, ${hre.network.name})`);
    return { address: equityAddress };
  });

task("ats:factory:deploy-bond", "Deploy a bond token through a deployed Factory")
  .addParam(
    "params",
    "Path to a JSON file with factory, securityData, bondDetails and regulation",
    undefined,
    types.string,
  )
  .addOptionalParam("privateKey", "The private key of the account in raw hexadecimal format", undefined, types.string)
  .addOptionalParam(
    "signerAddress",
    "The address of the signer to select from the Hardhat signers array",
    undefined,
    types.string,
  )
  .addOptionalParam("signerPosition", "The index of the signer in the Hardhat signers array", undefined, types.int)
  .setAction(async (args: FactoryDeployArgs, hre) => {
    const { deployBondFromFactory } = await import("@lib/domain");
    const { IFactory__factory } = await import("@contract-types");
    const { signer, address }: GetSignerResult = await hre.run("getSigner", {
      privateKey: args.privateKey,
      signerAddress: args.signerAddress,
      signerPosition: args.signerPosition,
    });

    const file = readParamsFile(args.params);
    if (!file.bondDetails) {
      throw new Error("Params file must include 'bondDetails' for a bond token");
    }

    const bond = await deployBondFromFactory(
      {
        adminAccount: file.adminAccount ?? address,
        factory: IFactory__factory.connect(file.factory, signer),
        securityData: file.securityData,
        bondDetails: file.bondDetails,
        proceedRecipients: file.proceedRecipients ?? [],
        proceedRecipientsData: file.proceedRecipientsData ?? [],
      },
      file.regulation,
    );

    const bondAddress = await bond.getAddress();
    console.log(`Bond token deployed at ${bondAddress} (factory ${file.factory}, ${hre.network.name})`);
    return { address: bondAddress };
  });
