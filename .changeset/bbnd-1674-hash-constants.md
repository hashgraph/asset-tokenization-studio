---
"@hashgraph/asset-tokenization-contracts": major
"@hashgraph/asset-tokenization-sdk": major
"@hashgraph/asset-tokenization-dapp": major
---

Normalise every keccak-derived `bytes32` constant across the ATS contracts package.

Identifiers and keccak inputs now follow a single mechanical rule: generic family first, specific name second. Canonical prefix is `asset.tokenization.standard.` (was `security.token.standard.`).

- Roles: `<NAME>_ROLE` becomes `ROLE_<NAME>` (e.g. `BOND_MANAGER_ROLE` -> `ROLE_BOND_MANAGER`). `DEFAULT_ADMIN_ROLE = 0x00` keeps its OpenZeppelin-compatible shape.
- Resolver keys: legacy `_<NAME>_RESOLVER_KEY` constants in `constants/resolverKeys.sol` move to file scope inside each `I<Feature>.sol` as `RESOLVER_KEY_<NAME>`. The central file is deleted.
- Storage locations: legacy `_<NAME>_STORAGE_POSITION` constants in `constants/storagePositions.sol` move into the matching `*StorageWrapper.sol` as `STORAGE_LOCATION_<NAME>`. The slot values now derive from the ERC-7201 formula `keccak256(abi.encode(uint256(keccak256(<id>)) - 1)) & ~bytes32(uint256(0xff))`. The central file is deleted.
- Corporate-action and scheduled-task type ids move to a new `constants/dispatchTypes.sol`. EIP-712 typehashes move to a new `constants/eip712.sol` and stay as foldable `keccak256("typedef")` literals.

A new TypeScript codegen (`scripts/codegen/hashGen.ts` + `applyHashGen.ts`) is the single source of truth for the hex values. Annotate any new `bytes32 constant` with `/// @custom:hash <kind> <PascalArg>` and run `npm run ats:contracts:hashes:generate`. CI gate `hashes:check` (in `105-flow-ats-static-checks.yaml`) blocks any drift between annotation and hex, plus duplicate `(kind, arg)` annotations, duplicate identifiers, hash-shaped constants missing an annotation, and non-canonical PascalCase args.

Breaking changes for downstream consumers:

- Every on-chain role hash changes value. Role grants on existing deployed assets are invalid.
- Every namespaced storage slot changes value (ERC-7201 derivation). Existing deployed proxies would read from the wrong slots.
- Every resolver key changes value. BLR configurations must be rebuilt.
- Every corporate-action and scheduled-task type id changes value.
- EIP-712 typehashes are unchanged - same typedef text, solc folding identical.
- SDK `SecurityRole` enum keeps its member names; only the hex literals are updated.

Incidental fix: `LOAN_CORPORATE_ACTION_TYPE` was a hand-rolled value (`0x8f3e2a1b...0e1f`), not a real keccak. Codegen now emits the correct `CORPORATE_ACTION_TYPE_LOAN` hash.
