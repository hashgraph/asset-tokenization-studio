// SPDX-License-Identifier: Apache-2.0

/**
 * Operational tasks for a deployed BusinessLogicResolver.
 *
 * There is no version ledger: the chain is the single source of truth. Every
 * task here reads the BLR's current state at runtime and acts on it — see the
 * responsibility table in DEPLOYMENT.md.
 */

import { task, types } from "hardhat/config";
import { GetSignerArgs, GetSignerResult } from "../lib/signer";

interface BlrInfoArgs {
  blr: string;
}

interface BlrRegisterFacetsArgs extends GetSignerArgs {
  blr: string;
  facets: string;
  allowOverwrite: boolean;
}

interface BlrUpgradeArgs extends GetSignerArgs {
  blr: string;
  facets: string;
  configs?: string;
}

interface BlrDeploySystemArgs extends GetSignerArgs {
  blr: string;
}

task("ats:blr:info", "List the facets registered in a BusinessLogicResolver")
  .addPositionalParam("blr", "The BusinessLogicResolver proxy address", undefined, types.string)
  .setAction(async (args: BlrInfoArgs, hre) => {
    const { getAllMockFacets, NON_DEPLOYABLE_INTERFACES, RESOLVER_KEYS_BY_FACET } = await import("@lib/domain");
    const { BusinessLogicResolver__factory } = await import("@contract-types");

    const blr = BusinessLogicResolver__factory.connect(args.blr, hre.ethers.provider);
    const count = Number(await blr.getBusinessLogicCount());

    // Reverse map resolver key → facet name, from facetKeys.ts plus the TEST-ONLY mocks
    // (excluded from FACET_KEY_ARGS since they carry no @custom:hash annotation). Mocks are
    // inserted FIRST so a production facet always wins a shared-key collision (MockDiamondCut
    // shares DiamondFacet's key, MockFactoryFacet shares FactoryFacet's) — a bare resolver key
    // cannot distinguish which variant is actually deployed at a given version, so this reports
    // the production name for both, same as before mocks were added to the map. Interfaces that
    // re-export a concrete facet's key (IComplianceFacet, IHoldFacet) are skipped for the same
    // reason: what is registered is the facet, not the interface.
    const skipped = new Set<string>(NON_DEPLOYABLE_INTERFACES);
    const keyToName = new Map<string, string>();
    for (const mock of getAllMockFacets()) {
      if (mock.resolverKey?.value) {
        keyToName.set(mock.resolverKey.value.toLowerCase(), mock.name);
      }
    }
    for (const [name, key] of Object.entries(RESOLVER_KEYS_BY_FACET)) {
      if (skipped.has(name)) continue;
      keyToName.set(key.toLowerCase(), name);
    }

    const batchSize = 100;
    const facets: { name: string; key: string; address: string }[] = [];
    for (let batch = 0; batch * batchSize < count; batch++) {
      const keys = await blr.getBusinessLogicKeys(batch, batchSize);
      for (const key of keys) {
        const address = await blr.resolveLatestBusinessLogic(key);
        facets.push({ name: keyToName.get(key.toLowerCase()) ?? "(unknown)", key, address });
      }
    }

    console.log(`BLR ${args.blr} on ${hre.network.name}: ${count} facets registered`);
    for (const facet of facets) {
      console.log(`  ${facet.name.padEnd(40)} ${facet.address}  ${facet.key}`);
    }
    return facets;
  });

task("ats:blr:register-facets", "Register additional facets in a deployed BusinessLogicResolver")
  .addPositionalParam("blr", "The BusinessLogicResolver proxy address", undefined, types.string)
  .addPositionalParam(
    "facets",
    "Comma-separated Name=address pairs, e.g. 'KycFacet=0xabc...,PauseFacet=0xdef...'",
    undefined,
    types.string,
  )
  .addFlag("allowOverwrite", "Allow overwriting facets already registered at a different address")
  .addOptionalParam("privateKey", "The private key of the account in raw hexadecimal format", undefined, types.string)
  .addOptionalParam(
    "signerAddress",
    "The address of the signer to select from the Hardhat signers array",
    undefined,
    types.string,
  )
  .addOptionalParam("signerPosition", "The index of the signer in the Hardhat signers array", undefined, types.int)
  .setAction(async (args: BlrRegisterFacetsArgs, hre) => {
    const { registerAdditionalFacets } = await import("@lib/operations");
    const { getResolverKey } = await import("@lib/domain");
    const { signer }: GetSignerResult = await hre.run("getSigner", {
      privateKey: args.privateKey,
      signerAddress: args.signerAddress,
      signerPosition: args.signerPosition,
    });

    const newFacets = args.facets.split(",").map((pair) => {
      const [name, address] = pair.split("=").map((s) => s.trim());
      if (!name || !address) {
        throw new Error(`Invalid facet entry '${pair}': expected Name=address`);
      }
      let resolverKey: string;
      try {
        resolverKey = getResolverKey(name);
      } catch {
        throw new Error(
          `No resolver key found for '${name}' in the ATS registry. ` +
            `For custom facets, use registerAdditionalFacets from @lib with your own registry.`,
        );
      }
      return { name, address, resolverKey };
    });

    const result = await registerAdditionalFacets(signer, {
      blrAddress: args.blr,
      newFacets,
      allowOverwrite: args.allowOverwrite,
    });
    console.log(`Registered ${result.registered.length} facets in BLR ${args.blr}`);
    return result;
  });

task(
  "ats:blr:upgrade",
  "Deploy new versions of facets, register them in the BLR and re-create the affected configurations",
)
  .addPositionalParam("blr", "The BusinessLogicResolver proxy address", undefined, types.string)
  .addPositionalParam(
    "facets",
    "Comma-separated facet names to upgrade, e.g. 'CouponFacet,PauseFacet'",
    undefined,
    types.string,
  )
  .addOptionalParam(
    "configs",
    "Comma-separated configurations to re-create (equity,bond,depositToken,factory). " +
      "Defaults to every configuration that contains an upgraded facet",
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
  .setAction(async (args: BlrUpgradeArgs, hre) => {
    const { deployContract, registerFacets, createBatchConfiguration } = await import("@lib/operations");
    const {
      deployOrchestratorLibraries,
      getFacetRequiredLibraries,
      LIBRARY_KEYS,
      CONFIG_IDS,
      EQUITY_FACETS,
      BOND_FACETS,
      DEPOSIT_TOKEN_FACETS,
      FACTORY_FACETS,
      getResolverKey,
    } = await import("@lib/domain");
    const { BusinessLogicResolver__factory } = await import("@contract-types");
    const { ZeroAddress } = await import("ethers");
    const { signer }: GetSignerResult = await hre.run("getSigner", {
      privateKey: args.privateKey,
      signerAddress: args.signerAddress,
      signerPosition: args.signerPosition,
    });

    const configFacets: Record<string, readonly string[]> = {
      equity: EQUITY_FACETS,
      bond: BOND_FACETS,
      depositToken: DEPOSIT_TOKEN_FACETS,
      factory: FACTORY_FACETS,
    };

    const resolverKeyOf = (name: string): string => {
      try {
        return getResolverKey(name);
      } catch {
        throw new Error(`No resolver key found for '${name}' in the ATS registry`);
      }
    };

    // Validate everything up-front, before any transaction
    const facetNames = args.facets
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (facetNames.length === 0) throw new Error("No facet names given");
    facetNames.forEach(resolverKeyOf);

    const configNames = args.configs
      ? args.configs
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : Object.keys(configFacets).filter((config) => configFacets[config].some((f) => facetNames.includes(f)));
    for (const config of configNames) {
      if (!(config in configFacets)) {
        throw new Error(`Unknown configuration '${config}' (expected: ${Object.keys(configFacets).join(", ")})`);
      }
    }

    const blr = BusinessLogicResolver__factory.connect(args.blr, signer);

    // 1. Deploy the orchestrator libraries if any upgraded facet links them
    const requiredLibs = new Set(facetNames.flatMap((name) => getFacetRequiredLibraries(name)));
    const libraryAddresses = requiredLibs.size > 0 ? await deployOrchestratorLibraries(signer) : undefined;

    // 2. Deploy a fresh copy of each facet
    const upgraded: { name: string; address: string; resolverKey: string }[] = [];
    for (const name of facetNames) {
      const libraries = Object.fromEntries(
        getFacetRequiredLibraries(name).map((lib) => [LIBRARY_KEYS[lib], libraryAddresses![lib]]),
      );
      const factory = await hre.ethers.getContractFactory(name, { signer, libraries });
      const { address } = await deployContract(factory);
      upgraded.push({ name, address, resolverKey: resolverKeyOf(name) });
      console.log(`Deployed ${name} at ${address}`);
    }

    // 3. Register the new copies — the BLR bumps each key's version on-chain
    await registerFacets(blr, { facets: upgraded });
    const newVersions = await blr.getLatestVersions(upgraded.map((f) => f.resolverKey));
    upgraded.forEach((facet, i) => console.log(`Registered ${facet.name} → version ${newVersions[i]}`));

    // 4. Re-create each affected configuration with its full facet list.
    //    createBatchConfiguration reads the latest version of every key from
    //    the chain and cancels any uncommitted draft left by a crashed run.
    const configVersions: Record<string, number> = {};
    const upgradedAddress = new Map(upgraded.map((f) => [f.name, f.address]));
    for (const config of configNames) {
      const entries = configFacets[config].map((name) => ({
        facetName: name,
        resolverKey: resolverKeyOf(name),
        address: upgradedAddress.get(name) ?? ZeroAddress,
      }));
      const result = await createBatchConfiguration(blr, {
        configurationId: CONFIG_IDS[config as keyof typeof CONFIG_IDS],
        facets: entries,
      });
      configVersions[config] = result.version;
      console.log(`Configuration ${config} re-created → version ${result.version}`);
    }

    return {
      facets: upgraded.map((facet, i) => ({ ...facet, version: Number(newVersions[i]) })),
      configs: configVersions,
    };
  });

task(
  "ats:blr:deploy-system",
  "Deploy the full ATS system on an existing BusinessLogicResolver: fresh facets, registration, new configurations and a new Factory",
)
  .addPositionalParam("blr", "The BusinessLogicResolver proxy address", undefined, types.string)
  .addOptionalParam("privateKey", "The private key of the account in raw hexadecimal format", undefined, types.string)
  .addOptionalParam(
    "signerAddress",
    "The address of the signer to select from the Hardhat signers array",
    undefined,
    types.string,
  )
  .addOptionalParam("signerPosition", "The index of the signer in the Hardhat signers array", undefined, types.int)
  .setAction(async (args: BlrDeploySystemArgs, hre) => {
    const { deployContract, registerFacets, createBatchConfiguration, deployResolverProxy } =
      await import("@lib/operations");
    const {
      deployOrchestratorLibraries,
      getFacetRequiredLibraries,
      getResolverKey,
      LIBRARY_KEYS,
      CONFIG_IDS,
      EQUITY_FACETS,
      BOND_FACETS,
      DEPOSIT_TOKEN_FACETS,
      FACTORY_FACETS,
      PRODUCTION_DEPLOY_FACETS,
      ROLES,
    } = await import("@lib/domain");
    const { BusinessLogicResolver__factory } = await import("@contract-types");
    const { signer }: GetSignerResult = await hre.run("getSigner", {
      privateKey: args.privateKey,
      signerAddress: args.signerAddress,
      signerPosition: args.signerPosition,
    });

    const blr = BusinessLogicResolver__factory.connect(args.blr, signer);
    const signerAddress = await signer.getAddress();

    // Validate everything up-front, before any transaction: the BLR must
    // exist and the signer must hold the roles that registration
    // (DEFAULT_ADMIN_ROLE) and configuration creation
    // (ROLE_CREATE_CONFIGURATION) require — failing later would leave ~100
    // orphan facet deployments behind.
    if ((await hre.ethers.provider.getCode(args.blr)) === "0x") {
      throw new Error(`No contract found at BLR address ${args.blr}`);
    }
    for (const role of ["DEFAULT_ADMIN_ROLE", "ROLE_CREATE_CONFIGURATION"] as const) {
      if (!(await blr.hasRole(ROLES[role], signerAddress))) {
        throw new Error(`Signer ${signerAddress} is missing ${role} on BLR ${args.blr}`);
      }
    }

    // 1. Fresh orchestrator libraries for the new facet copies
    const libraryAddresses = await deployOrchestratorLibraries(signer);

    // 2. Deploy a fresh copy of every production facet
    const deployed: { name: string; address: string; resolverKey: string }[] = [];
    for (const name of PRODUCTION_DEPLOY_FACETS) {
      const libraries = Object.fromEntries(
        getFacetRequiredLibraries(name).map((lib) => [LIBRARY_KEYS[lib], libraryAddresses[lib]]),
      );
      const factory = await hre.ethers.getContractFactory(name, { signer, libraries });
      const { address } = await deployContract(factory);
      deployed.push({ name, address, resolverKey: getResolverKey(name) });
      console.log(`Deployed ${name} at ${address}`);
    }

    // 3. Register the new copies — the BLR bumps each key's version on-chain
    const registration = await registerFacets(blr, { facets: deployed });
    const newVersions = await blr.getLatestVersions(deployed.map((f) => f.resolverKey));
    console.log(`Registered ${registration.registered.length} facets in BLR ${args.blr}`);

    // 4. Create every configuration. createBatchConfiguration reads the
    //    latest version of every key from the chain (no offset assumptions)
    //    and cancels any uncommitted draft left by a crashed run.
    const configFacets: Record<string, readonly string[]> = {
      equity: EQUITY_FACETS,
      bond: BOND_FACETS,
      depositToken: DEPOSIT_TOKEN_FACETS,
      factory: FACTORY_FACETS,
    };
    const deployedAddress = new Map(deployed.map((f) => [f.name, f.address]));
    const configVersions: Record<string, number> = {};
    for (const config of Object.keys(configFacets)) {
      const entries = configFacets[config].map((name) => ({
        facetName: name,
        resolverKey: getResolverKey(name),
        address: deployedAddress.get(name)!,
      }));
      const result = await createBatchConfiguration(blr, {
        configurationId: CONFIG_IDS[config as keyof typeof CONFIG_IDS],
        facets: entries,
      });
      configVersions[config] = result.version;
      console.log(`Configuration ${config} created → version ${result.version}`);
    }

    // 5. New Factory pinned to the configuration version just created
    //    (replacementEnabled matches genesis; the Factory is permissionless)
    const factoryResult = await deployResolverProxy(signer, {
      blrAddress: args.blr,
      configurationId: CONFIG_IDS.factory,
      version: configVersions.factory,
      replacementEnabled: true,
    });
    console.log(`Factory deployed at ${factoryResult.proxyAddress} (config version ${configVersions.factory})`);

    return {
      facets: deployed.map((facet, i) => ({ ...facet, version: Number(newVersions[i]) })),
      configs: configVersions,
      factory: { address: factoryResult.proxyAddress, version: configVersions.factory },
    };
  });
