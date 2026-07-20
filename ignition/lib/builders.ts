// SPDX-License-Identifier: Apache-2.0

/**
 * Ignition module builders. They are functions (not top-level modules) so one
 * body yields both the production and timetravel variants; memoization
 * (perMode) then restores the build-once guarantee that plain modules get for
 * free. Module ids are the journal's resume keys and MUST NOT change;
 * timetravel suffixes them with "TimeTravel" so journals never mix.
 * The files under `ignition/modules/*` are thin wrappers over these builders.
 */

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import type { ContractFuture, Future, IgnitionModule } from "@nomicfoundation/ignition-core";

import { ATS_ROLES, CONFIG_IDS } from "../../lib/domain/constants";
import { FACET_REGISTRATION_BATCH_SIZE } from "../../lib/operations/constants";
import { DEFAULT_BATCH_SIZE } from "../../lib/operations/constants";
import { buildFacetList } from "../../lib/domain/facetEnvironment";
import { EQUITY_FACETS, BOND_FACETS, DEPOSIT_TOKEN_FACETS, FACTORY_FACETS } from "../../lib/domain/facetSets";
import { INITIALIZE_MOCK_FACETS, INITIALIZE_MOCK_CONFIG_ID } from "../../lib/domain/initializeMock/mockFacetsRegistry";
import {
  chunk,
  facetDeployList,
  linkedLibraryNames,
  registrationVersions,
  resolverKeyOf,
  TIMETRAVEL_MODE,
  type DeploymentMode,
} from "./shared";

const suffixOf = (mode: DeploymentMode): string => (mode === TIMETRAVEL_MODE ? "TimeTravel" : "");

/** Memoizes a builder per mode — an Ignition module must be built exactly once. */
function perMode<T>(build: (mode: DeploymentMode) => T): (mode: DeploymentMode) => T {
  const cache = new Map<DeploymentMode, T>(); // per-builder cache (closure)
  return (mode) => {
    let value = cache.get(mode);
    if (value === undefined) {
      value = build(mode); // first call for this mode: build and store
      cache.set(mode, value);
    }
    return value; // later calls: same instance, never rebuilt
  };
}

// ---------------------------------------------------------------------------
// Governance core: the BLR behind a TransparentUpgradeableProxy + ProxyAdmin.
// `m.contractAt` deploys nothing — it types the proxy address as a BLR. The
// post-deploy calls need explicit `after`: their order is not inferable.
// ---------------------------------------------------------------------------
export const getBlrModule = perMode((mode) =>
  buildModule(`AtsBlr${suffixOf(mode)}`, (m) => {
    const deployer = m.getAccount(0);

    const proxyAdmin = m.contract("ProxyAdmin");
    const blrImplementation = m.contract("BusinessLogicResolver");
    const blrProxy = m.contract("TransparentUpgradeableProxy", [blrImplementation, proxyAdmin, "0x"]);
    const blr = m.contractAt("BusinessLogicResolver", blrProxy, { id: "Blr" });

    const blrInitialized = m.call(blr, "initializeBusinessLogicResolver");
    m.call(blr, "grantRole", [ATS_ROLES.ROLE_CREATE_CONFIGURATION, deployer], {
      after: [blrInitialized],
    });

    return { proxyAdmin, blrImplementation, blr };
  }),
);

// ---------------------------------------------------------------------------
// Orchestrator libraries (TokenCoreOps, ClearingOps, ...): deployed standalone
// and linked into facet bytecode. `getLibraryFuture` recurses so each library
// declares its own dependencies first, straight from the artifacts.
// ---------------------------------------------------------------------------
export const getLibrariesModule = perMode((mode) =>
  buildModule(`OrchestratorLibraries${suffixOf(mode)}`, (m) => {
    const libraries = new Map<string, ContractFuture<string>>();

    const getLibraryFuture = (name: string): ContractFuture<string> => {
      let future = libraries.get(name);
      if (future === undefined) {
        future = m.library(name, {
          libraries: Object.fromEntries(linkedLibraryNames(name).map((dep) => [dep, getLibraryFuture(dep)])),
        });
        libraries.set(name, future);
      }
      return future;
    };

    for (const facet of facetDeployList(mode)) {
      for (const library of linkedLibraryNames(facet.name)) {
        getLibraryFuture(library);
      }
    }

    return Object.fromEntries(libraries);
  }),
);

// ---------------------------------------------------------------------------
// Facet catalog: deploy every facet (list comes from the registry) and
// register it in the BLR. Batches are chained serially because on-chain
// versions depend on registration order (registrationVersions).
// ---------------------------------------------------------------------------
export const getFacetsModule = perMode((mode) => {
  const blrModule = getBlrModule(mode);
  const librariesModule = getLibrariesModule(mode);

  return buildModule(`AtsFacets${suffixOf(mode)}`, (m) => {
    const { blr } = m.useModule(blrModule);
    const libraries = m.useModule(librariesModule);

    const definitions = facetDeployList(mode);

    const facets: Record<string, ContractFuture<string>> = {};
    for (const definition of definitions) {
      facets[definition.name] = m.contract(definition.name, [], {
        libraries: Object.fromEntries(linkedLibraryNames(definition.name).map((lib) => [lib, libraries[lib]])),
      });
    }

    const registrable = definitions.filter((f) => f.resolverKey?.value);

    let lastRegistration: Future | undefined;
    chunk(registrable, FACET_REGISTRATION_BATCH_SIZE).forEach((batch, index) => {
      const registrations = batch.map((f) => ({
        businessLogicKey: f.resolverKey!.value,
        businessLogicAddress: facets[f.name],
      }));
      lastRegistration = m.call(blr, "registerBusinessLogics", [registrations], {
        id: `registerBatch${index}`,
        after: [lastRegistration ?? blrModule],
      });
    });

    return facets;
  });
});

// ---------------------------------------------------------------------------
// BLR configurations: the versioned facet list composing each token type.
// Versions are not hardcoded — registrationVersions(mode) reproduces the
// BLR's +1-per-registration arithmetic; the BLR reverts on a mismatch.
// ---------------------------------------------------------------------------
function buildConfigurationModule(
  mode: DeploymentMode,
  name: string,
  configurationId: string,
  facetNames: readonly string[],
): IgnitionModule {
  const blrModule = getBlrModule(mode);
  const facetsModule = getFacetsModule(mode);
  const versions = registrationVersions(mode);

  return buildModule(`${name}Configuration${suffixOf(mode)}`, (m) => {
    const { blr } = m.useModule(blrModule);
    m.useModule(facetsModule);

    let previous: Future | undefined;
    chunk(facetNames, DEFAULT_BATCH_SIZE).forEach((batch, index, batches) => {
      const configurations = batch.map((facetName) => {
        const version = versions.get(facetName);
        if (version === undefined) throw new Error(`Facet not in registration plan: ${facetName}`);
        return { id: resolverKeyOf(facetName), version };
      });
      const isLastBatch = index === batches.length - 1;
      previous = m.call(blr, "createBatchConfiguration", [configurationId, configurations, isLastBatch, "0x"], {
        id: `batch${index}`,
        after: [previous ?? facetsModule],
      });
    });

    return {};
  });
}

export const getEquityConfiguration = perMode((mode) =>
  buildConfigurationModule(mode, "Equity", CONFIG_IDS.equity, buildFacetList(EQUITY_FACETS, mode === TIMETRAVEL_MODE)),
);
export const getBondConfiguration = perMode((mode) =>
  buildConfigurationModule(mode, "Bond", CONFIG_IDS.bond, buildFacetList(BOND_FACETS, mode === TIMETRAVEL_MODE)),
);
export const getDepositTokenConfiguration = perMode((mode) =>
  buildConfigurationModule(
    mode,
    "DepositToken",
    CONFIG_IDS.depositToken,
    buildFacetList(DEPOSIT_TOKEN_FACETS, mode === TIMETRAVEL_MODE),
  ),
);
// The factory config skips buildFacetList: in test mode it is replaced
// entirely with MockFactoryFacet.
export const getFactoryConfiguration = perMode((mode) =>
  buildConfigurationModule(
    mode,
    "Factory",
    CONFIG_IDS.factory,
    mode === TIMETRAVEL_MODE ? ["MockFactoryFacet"] : [...FACTORY_FACETS],
  ),
);

// ---------------------------------------------------------------------------
// TEST-ONLY (timetravel): extra copies of MockFacet1/2/3 (bumping them to
// v2/v3) and 2 versions of configId 9 with hand-pinned version maps.
// ---------------------------------------------------------------------------
const MOCK_FACETS_TO_MULTIPLY = ["MockFacet1", "MockFacet2", "MockFacet3"] as const;
const INITIALIZE_MOCK_VERSION_MAPS: ReadonlyArray<Record<string, number>> = [
  { InitializerFacet: 1, MockDiamondCut: 1, MockFacet1: 1, MockFacet2: 2, MockFacet3: 1 },
  { InitializerFacet: 1, MockDiamondCut: 1, MockFacet1: 3, MockFacet2: 3, MockFacet3: 3 },
];

let initializeMockModule: IgnitionModule | undefined;
export function getInitializeMockModule(): IgnitionModule {
  if (initializeMockModule) return initializeMockModule;

  const blrModule = getBlrModule(TIMETRAVEL_MODE);
  const facetsModule = getFacetsModule(TIMETRAVEL_MODE);

  initializeMockModule = buildModule("InitializeMockConfigurationTimeTravel", (m) => {
    const { blr } = m.useModule(blrModule);
    m.useModule(facetsModule);

    // Extra copies: each registration bumps the mock's key to the next version.
    let previous: Future | undefined;
    for (const name of MOCK_FACETS_TO_MULTIPLY) {
      for (const version of [2, 3]) {
        const copy = m.contract(name, [], { id: `${name}V${version}` });
        previous = m.call(
          blr,
          "registerBusinessLogics",
          [[{ businessLogicKey: resolverKeyOf(name), businessLogicAddress: copy }]],
          { id: `register${name}V${version}`, after: [previous ?? facetsModule] },
        );
      }
    }

    // Two configId versions, in order — each map pins per-facet versions.
    INITIALIZE_MOCK_VERSION_MAPS.forEach((versionMap, index) => {
      const configurations = INITIALIZE_MOCK_FACETS.map((facetName) => ({
        id: resolverKeyOf(facetName),
        version: versionMap[facetName],
      }));
      previous = m.call(blr, "createBatchConfiguration", [INITIALIZE_MOCK_CONFIG_ID, configurations, true, "0x"], {
        id: `configV${index + 1}`,
        after: [previous!],
      });
    });

    return {};
  });
  return initializeMockModule;
}

// ---------------------------------------------------------------------------
// Public entry point: the Factory, a ResolverProxy on the factory config.
// Its constructor reverts if the config doesn't exist yet.
// ---------------------------------------------------------------------------
export const getFactoryModule = perMode((mode) => {
  const blrModule = getBlrModule(mode);
  const factoryConfiguration = getFactoryConfiguration(mode);

  return buildModule(`AtsFactory${suffixOf(mode)}`, (m) => {
    const { blr } = m.useModule(blrModule);
    m.useModule(factoryConfiguration);

    const factory = m.contract(
      "ResolverProxy",
      [
        blr,
        { configurationId: CONFIG_IDS.factory, configurationVersion: 1, replacementEnabled: true },
        [], // empty rbacs — the Factory is permissionless in v1
      ],
      { id: "Factory", after: [factoryConfiguration] },
    );

    return { factory };
  });
});

// ---------------------------------------------------------------------------
// Root module: composition only (see `hardhat ignition visualize`).
// ---------------------------------------------------------------------------
export const getSystemModule = perMode((mode) =>
  buildModule(`AtsSystem${suffixOf(mode)}`, (m) => {
    const { proxyAdmin, blrImplementation, blr } = m.useModule(getBlrModule(mode));
    const libraries = m.useModule(getLibrariesModule(mode));
    const facets = m.useModule(getFacetsModule(mode));
    m.useModule(getEquityConfiguration(mode));
    m.useModule(getBondConfiguration(mode));
    m.useModule(getDepositTokenConfiguration(mode));
    if (mode === TIMETRAVEL_MODE) m.useModule(getInitializeMockModule());
    const { factory } = m.useModule(getFactoryModule(mode)); // pulls in FactoryConfiguration

    // Re-export facets and libraries so the test fixture gets their addresses
    // without reading files (adds no futures, just references).
    return { proxyAdmin, blrImplementation, blr, factory, ...libraries, ...facets };
  }),
);
