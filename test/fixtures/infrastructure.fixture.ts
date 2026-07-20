// SPDX-License-Identifier: Apache-2.0

/**
 * Core ATS infrastructure fixtures.
 *
 * Deploys the full system via Hardhat Ignition (`hre.ignition.deploy` on the
 * AtsTimeTravelSystem / AtsSystem module trees) and returns typed contract
 * instances plus a `deployment` metadata object (infrastructure / facets /
 * configurations / summary / helpers) that downstream fixtures spread and
 * extend.
 *
 * Uses Hardhat Network Helpers loadFixture pattern for efficient test setup.
 * Each fixture is executed once and snapshotted, subsequent calls restore state.
 *
 * @see https://hardhat.org/hardhat-network-helpers/docs/reference#loadfixture
 */

import hre, { ethers } from "hardhat";
import "@nomicfoundation/hardhat-ignition-ethers"; // module augmentation: hre.ignition
import { getSystemModule } from "../../ignition/lib/builders";
import { facetDeployList, registrationVersions, resolverKeyOf, type DeploymentMode } from "../../ignition/lib/shared";
import { buildFacetList } from "../../lib/domain/facetEnvironment";
import { CONFIG_IDS } from "../../lib/domain/constants";
import {
  setOrchestratorLibraryAddresses,
  type OrchestratorLibraryAddresses,
} from "../../lib/domain/orchestratorLibraries";
import { EQUITY_FACETS, BOND_FACETS, DEPOSIT_TOKEN_FACETS, FACTORY_FACETS } from "../../lib/domain/facetSets";
import type { ConfigurationMetadata, FacetMetadata } from "../../lib/operations/types";
import {
  Factory__factory,
  BusinessLogicResolver__factory,
  ProxyAdmin__factory,
  IMockFactory__factory,
} from "@contract-types";
import type { IFactory, IMockFactory, BusinessLogicResolver, ProxyAdmin } from "@contract-types";

/**
 * Fixture: Deploy complete ATS infrastructure via Ignition.
 *
 * Deploys: ProxyAdmin, BLR, Factory, all Facets, all configurations (and the
 * InitializeMock domain when `useTimeTravel`).
 *
 * @param useTimeTravel - Use the TimeTravel module tree (default: true for tests)
 * @returns Typed contracts + deployment metadata + facet key maps
 */
export async function deployAtsInfrastructureFixture(useTimeTravel = true) {
  const signers = await ethers.getSigners();
  const [deployer, user1, user2, user3, user4, user5] = signers;
  const unknownSigner = signers.at(-1)!;

  const mode: DeploymentMode = useTimeTravel ? "timetravel" : "production";
  // The module result re-exports ~110 facets, so index by name; the
  // fine-grained ignition-ethers typing doesn't help here.
  const deployed = (await hre.ignition.deploy(getSystemModule(mode))) as unknown as Record<
    string,
    { getAddress(): Promise<string> }
  >;

  const blrAddress = await deployed.blr.getAddress();
  const factoryAddress = await deployed.factory.getAddress();
  const proxyAdminAddress = await deployed.proxyAdmin.getAddress();

  // Some tests (getLibLinks/getFacetLibraryLinks) need the library address
  // registry populated to link TypeChain factories; fill it from the Ignition
  // result (the root module re-exports the library futures).
  const libraryAddressOf = async (name: string): Promise<string> => {
    const future = deployed[name];
    if (!future) throw new Error(`Ignition root module does not re-export library ${name}`);
    return future.getAddress();
  };
  const libraryAddresses: OrchestratorLibraryAddresses = {
    tokenCoreOps: await libraryAddressOf("TokenCoreOps"),
    holdOps: await libraryAddressOf("HoldOps"),
    clearingOps: await libraryAddressOf("ClearingOps"),
    clearingLifecycleOps: await libraryAddressOf("ClearingLifecycleOps"),
    clearingReadOps: await libraryAddressOf("ClearingReadOps"),
    clearingProtectedOps: await libraryAddressOf("ClearingProtectedOps"),
    scheduledTasksOps: await libraryAddressOf("ScheduledTasksOps"),
    scheduledTasksDispatchOps: await libraryAddressOf("ScheduledTasksDispatchOps"),
  };
  setOrchestratorLibraryAddresses(libraryAddresses);

  // Deployment metadata, built from static data (same sources the modules
  // use) plus the addresses from the Ignition result.
  const versions = registrationVersions(mode);
  const facets: FacetMetadata[] = await Promise.all(
    facetDeployList(mode)
      .filter((f) => f.resolverKey?.value)
      .map(async (f) => ({
        name: f.name,
        address: await deployed[f.name].getAddress(),
        key: f.resolverKey!.value,
        version: versions.get(f.name),
      })),
  );
  const byName = new Map(facets.map((f) => [f.name, f]));
  const metadataFor = (names: readonly string[]): FacetMetadata[] =>
    names.map((name) => byName.get(name) ?? { name, address: "", key: resolverKeyOf(name) });

  const configurationLists: Record<string, readonly string[]> = {
    equity: buildFacetList(EQUITY_FACETS, useTimeTravel),
    bond: buildFacetList(BOND_FACETS, useTimeTravel),
    depositToken: buildFacetList(DEPOSIT_TOKEN_FACETS, useTimeTravel),
    factory: useTimeTravel ? ["MockFactoryFacet"] : [...FACTORY_FACETS],
  };
  const configurations = Object.fromEntries(
    Object.entries(configurationLists).map(([name, list]): [string, ConfigurationMetadata] => [
      name,
      {
        configId: CONFIG_IDS[name as keyof typeof CONFIG_IDS],
        version: 1,
        facetCount: list.length,
        facets: metadataFor(list).map((f) => ({ facetName: f.name, key: f.key, address: f.address })),
      },
    ]),
  ) as {
    equity: ConfigurationMetadata;
    bond: ConfigurationMetadata;
    depositToken: ConfigurationMetadata;
    factory: ConfigurationMetadata;
  };

  const deployment = {
    network: "hardhat",
    timestamp: new Date().toISOString(),
    deployer: await deployer.getAddress(),
    infrastructure: {
      proxyAdmin: { address: proxyAdminAddress },
      blr: { implementation: await deployed.blrImplementation.getAddress(), proxy: blrAddress },
      factory: {
        implementation: byName.get(useTimeTravel ? "MockFactoryFacet" : "FactoryFacet")?.address ?? "",
        proxy: factoryAddress,
      },
    },
    facets,
    configurations,
    summary: {
      totalContracts: facets.length + 3,
      totalFacets: facets.length,
      totalConfigurations: 4,
      deploymentTime: 0,
      gasUsed: "0",
      success: true,
    },
    helpers: {
      getEquityFacets: () => metadataFor(configurationLists.equity),
      getBondFacets: () => metadataFor(configurationLists.bond),
      getDepositTokenFacets: () => metadataFor(configurationLists.depositToken),
      getFactoryFacets: () => metadataFor(configurationLists.factory),
    },
  };

  // Get typed contract instances using TypeChain factories
  const factory = useTimeTravel
    ? (IMockFactory__factory.connect(factoryAddress, deployer) as IMockFactory)
    : (Factory__factory.connect(factoryAddress, deployer) as IFactory);

  const blr = BusinessLogicResolver__factory.connect(blrAddress, deployer) as BusinessLogicResolver;

  const proxyAdmin = ProxyAdmin__factory.connect(proxyAdminAddress, deployer) as ProxyAdmin;

  const toKeyMap = (list: FacetMetadata[]): Record<string, string> =>
    list.reduce(
      (acc, f) => {
        acc[f.name] = f.key;
        return acc;
      },
      {} as Record<string, string>,
    );

  return {
    // Signers
    signers,
    deployer,
    user1,
    user2,
    user3,
    user4,
    user5,
    unknownSigner,

    // Core infrastructure
    factory,
    blr,
    proxyAdmin,

    // Deployment metadata
    deployment,

    // Facet keys (useful for verification)
    facetKeys: toKeyMap(facets),
    equityFacetKeys: toKeyMap(deployment.helpers.getEquityFacets()),
    bondFacetKeys: toKeyMap(deployment.helpers.getBondFacets()),
    depositTokenFacetKeys: toKeyMap(deployment.helpers.getDepositTokenFacets()),
    factoryFacetKeys: toKeyMap(deployment.helpers.getFactoryFacets()),
  };
}
