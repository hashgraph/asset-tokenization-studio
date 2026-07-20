# Deployment guide

The system deploys with [Hardhat Ignition](https://hardhat.org/ignition). Modules live in
`ignition/modules/` (one per functional area), shared logic in `ignition/lib/`. Ignition records every
transaction in a journal under `ignition/deployments/<id>/` — that journal is the deployment's state and,
for real networks, is committed to git.

## Deploy the system

```bash
npm run ignition:deploy:hedera:testnet   # full system on Hedera testnet (id: ats-hedera-testnet)
npm run ignition:deploy:hedera:mainnet   # full system on Hedera mainnet (id: ats-hedera-mainnet)
npm run ignition:deploy:besu             # full system on besu-iob (id: besu-iob)
npm run ignition:deploy:local            # against a running `npx hardhat node` (id: ats-local)
npm run ignition:deploy:timetravel:local # test mode (TimeTravel + mocks), local (id: ats-tt-local)
```

### How it works

`AtsSystem` is composition only — the real work happens in the submodules it pulls in (bodies in
`ignition/lib/builders.ts`), in dependency order:

| Module                                            | What it does                                                                                       |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `AtsBlr`                                          | `ProxyAdmin` + BLR implementation + `TransparentUpgradeableProxy`, then `initialize` + `grantRole` |
| `OrchestratorLibraries`                           | Every library linked by some facet (`TokenCoreOps`, `ClearingOps`, ...), each after its own deps   |
| `AtsFacets`                                       | Deploys every facet (linking the libraries) and registers them in the BLR                          |
| `{Equity,Bond,DepositToken,Factory}Configuration` | Creates each token type's versioned facet list in the BLR (`createBatchConfiguration`)             |
| `AtsFactory`                                      | The `ResolverProxy` Factory, pinned to the factory configuration                                   |

- **Inspect** the result on-chain: `npx hardhat ats:blr:info <blr> --network <net>`.
- **See the system**: `npm run ignition:visualize` renders the module graph as an HTML report.

Keys and endpoints come from `.env` (see `.env.example`): `HEDERA_TESTNET_PRIVATE_KEY_0`, etc.
The `besu-iob` network is the exception: a throwaway test key lives directly in `hardhat.config.ts`.

## Upgrade facets or configurations

Upgrades do **not** go through Ignition and there is no version ledger: the chain is the single source
of truth. One task deploys fresh copies of the changed facets, registers them (the BLR bumps each key's
version on-chain by itself) and re-creates the affected configurations reading the current version of
every facet from the chain:

```bash
npx hardhat ats:blr:upgrade <blrAddress> CouponFacet,PauseFacet --network hedera-testnet
# --configs equity,bond to override; defaults to every configuration containing an upgraded facet
```

Orchestrator libraries are redeployed automatically when an upgraded facet links them. If a previous run
died mid-configuration, the task detects the uncommitted draft batch on-chain and cancels it before
retrying — re-running is always safe. Issued tokens stay pinned to their old configuration version until
you move them (`ats:token:update-version`).

The BLR's own proxy implementation is upgraded like any other TUP: `ats:proxy:upgrade`.

## Re-deploy the system on an existing BLR

To stand up a complete fresh system (all facets, all configurations, a new Factory) reusing a BLR that
is already live, use a task — not Ignition. Ignition fixes every value when it builds the module graph,
so it cannot read the BLR's current per-key versions; the task reads them from the chain, which also
covers BLRs whose facets have been upgraded individually:

```bash
npx hardhat ats:blr:deploy-system <blrAddress> --network hedera-testnet
```

The signer must hold `DEFAULT_ADMIN_ROLE` and `ROLE_CREATE_CONFIGURATION` on the target BLR — the task
checks both before deploying anything. Re-running after an interruption is safe: registrations bump
versions again and configurations are re-created reading the latest state (orphan versions on-chain are
harmless).

## Manage live contracts (`ats:*` tasks)

Ignition deploys the system once, with a journal. Everything after that operates on **runtime state**
and goes through thin Hardhat tasks that wrap the atomic operations in `lib/`, always reading the
current state from the chain. A task never contains logic: new tasks copy the shape of an existing one
(validate before signing, resolve the signer via `getSigner`, call a `lib/` operation) and get a smoke
test in `test/scripts/integration/atsTasks.test.ts` plus a row in this table.

| Need                                                                      | Command                                                                         |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Upgrade facets + re-create configurations in a BLR                        | `npx hardhat ats:blr:upgrade <blr> <Facet1,Facet2> [--configs equity,bond]`     |
| Full system re-deploy on an existing BLR (facets + configs + new Factory) | `npx hardhat ats:blr:deploy-system <blr> --network <net>`                       |
| Read an issued token's pinned (resolver, config, version)                 | `npx hardhat ats:token:info <proxy> --network <net>`                            |
| Bump an issued token's configuration version                              | `npx hardhat ats:token:update-version <proxy> <version> --network <net>`        |
| Re-pin an issued token to another configuration                           | `npx hardhat ats:token:update-config <proxy> <configId> <version> ...`          |
| Re-point an issued token to another BLR                                   | `npx hardhat ats:token:update-resolver <proxy> <blr> <configId> <version> ...`  |
| List the facets registered in a BLR                                       | `npx hardhat ats:blr:info <blr> --network <net>`                                |
| Register already-deployed facets in a BLR                                 | `npx hardhat ats:blr:register-facets <blr> "KycFacet=0x...,PauseFacet=0x..."`   |
| TUP implementation upgrade (check / prepare / execute)                    | `npx hardhat ats:proxy:upgrade <proxy> <proxyAdmin> [--check] [--prepare-only]` |
| Deploy a token through the Factory                                        | `npx hardhat ats:factory:deploy-equity --params token.json` (same for `-bond`)  |
| Compute a resolver-key / role hash                                        | `npx hardhat ats:hash <kind> <Arg>`                                             |

Signer selection is shared by all write tasks: `--private-key`, `--signer-address` or
`--signer-position` (defaults to the first configured signer). Facet resolver keys are looked up in
`lib/domain/facetKeys.ts`, so `ats:blr:register-facets` only needs `Name=address` pairs. The `--params`
JSON for factory deploys mirrors the `deployEquityFromFactory` / `deployBondFromFactory` parameters:

```jsonc
{
  "factory": "0x...", // Factory ResolverProxy
  "securityData": { "resolver": "0x...", "...": "..." },
  "equityDetails": { "votingRight": true, "...": "..." }, // or "bondDetails" for ats:factory:deploy-bond
  "regulation": { "regulationType": 1, "regulationSubType": 0, "additionalSecurityData": { "...": "..." } },
}
```

## Add a new facet

One task computes the hash, two hand-pastes mirror it, three unit-test guards catch anything missed.

1. Write the contract like any existing facet.
2. Compute its resolver key: `npx hardhat ats:hash resolverKey Foo` (the arg is the facet name minus
   `"Facet"`, PascalCase).
3. Declare the constant next to the facet's interface, with its annotation:

   ```solidity
   /// @custom:hash resolverKey Foo
   bytes32 constant RESOLVER_KEY_FOO = 0x...; // output of step 2
   ```

4. Mirror it in `lib/domain/facetKeys.ts` — one file, two maps, alphabetical position (declaration
   order is BLR registration order): `FooFacet: "Foo"` in `FACET_KEY_ARGS` and the same literal in
   `RESOLVER_KEYS_BY_FACET`.
5. If it composes a token type, add it to the tier lists in `lib/domain/facetSets.ts` or to the
   `*_FACETS` list in that type's `createConfiguration.ts`.
6. `npm run compile && npm run test:scripts:unit` — the guards name anything you missed with the exact
   fix: a missing map entry or annotation (`facetKeys.test.ts`), a mispasted hash
   (`hashConsistency.test.ts`). Linked orchestrator libraries need no wiring — they are read from the
   compiled artifact's `linkReferences`.
7. Ship it. Genesis deploys pick it up automatically (Ignition derives the deploy list from
   `ALL_FACETS`); on a live system use `ats:blr:register-facets` (already deployed) or
   `ats:blr:upgrade <blr> FooFacet` (deploy + register + re-create configurations).

Roles follow the same pattern in miniature: `npx hardhat ats:hash role <Arg>`, pasted into
`contracts/constants/roles.sol` and `lib/domain/roles.ts`.

## Hedera-specific behavior

The JSON-RPC relay simulates `eth_estimateGas`/`eth_call` against mirror-node state, which lags consensus
by seconds. `hardhat.config.ts` ships a provider wrapper (hedera-* networks only) that retries simulations
with backoff and falls back to a fixed gas limit — you may see `retry n/8 (mirror-node lag?)` warnings
during deploys; that's the mitigation working, not an error. For production deploys, consider running your
own relay + mirror node instead of the public hashio instance.

## Tests

The integration test fixture (`test/fixtures/infrastructure.fixture.ts`) deploys the TimeTravel mode via
`hre.ignition.deploy` — the same modules used on real networks, snapshotted per test by `loadFixture`.
