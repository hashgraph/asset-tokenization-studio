# ATS Contracts - Knowledge Base

**Scope**: `packages/ats/contracts` (416 Solidity files)

## OVERVIEW

Diamond pattern (EIP-2535) smart contracts for ERC-1400/ERC-3643 security tokens on Hedera. 46+ facets across 4 layers.

## STRUCTURE

```
contracts/
├── constants/          # EIP1066, roles, storage positions
├── domain/             # Layer 0 - Abstract storage wrappers
│   ├── core/           # Core storage (Pause, AccessControl, Kyc, etc.)
│   └── asset/          # Domain storage (Bond, Equity, Hold, Clearing)
├── facets/             # Layer 1-3 implementations
│   ├── layer_1/        # Core business logic (hereda Layer 0)
│   ├── layer_2/        # Domain-specific (Bond, Equity - hereda Layer 0)
│   └── layer_3/        # Jurisdiction-specific (bondUSA, equityUSA)
├── factory/            # TREXFactory, ERC3643 deployment
├── infrastructure/     # Diamond proxy, BLR, utils
└── test/               # Integration + unit tests
```

## WHERE TO LOOK

| Task                 | Location                         | Notes                       |
| -------------------- | -------------------------------- | --------------------------- |
| Add storage wrapper  | `domain/core/` o `domain/asset/` | Abstract contract, EIP-1967 |
| Add facet            | `facets/layer_1/`                | Hereda de storage wrapper   |
| Add domain logic     | `facets/layer_2/`                | Bond.sol, Equity.sol        |
| Jurisdiction feature | `facets/layer_3/`                | bondUSA/, equityUSA/        |
| Deployment scripts   | `scripts/`                       | Checkpoint system enabled   |
| Roles                | `constants/roles.sol`            | 3-layer role system         |
| Tests                | `test/contracts/`                | Hardhat test framework      |

## CONVENTIONS

**Solidity**: 0.8.18, `immutable` para gas optimization, custom errors.

**Storage**: Layer 0 wrappers abstractos en `domain/`, EIP-1967 storage pattern.

**Inheritance**: Facets heredan de storage wrappers (`Pause.sol → PauseStorageWrapper`).

**Layer 2**: Bond.sol, Equity.sol heredan directamente de Layer 0 wrappers.

**Naming**: `IStorageWrapper` interfaces, `*StorageWrapper.sol` abstractos, `Facet` implementations.

## ANTI-PATTERNS

- **NEVER** modificar storage slots directamente - usar wrappers abstractos
- **DO NOT** crear carpeta `layer_0/` - storage wrappers van en `domain/`
- **NEVER** hacer facets de Layer 1 heredar de otros facets - solo de wrappers
- **DO NOT** skip checkpoint system tras deployment fallido
- **NEVER** editar TypeChain manualmente - regenerar con `npm run typechain`

## UNIQUE STYLES

**Layer 0 en `domain/`**: `PauseStorageWrapper`, `BondStorageWrapper`, `EquityStorageWrapper` - todos `abstract contract`.

**Inheritance Directa**: Bond.sol hereda de `PauseStorageWrapper` + `BondStorageWrapper` (no hay Layer 1 intermedio).

**Layer 1**: Core facets (Pause, AccessControl, Freeze) con business logic básico.

**Layer 2**: Domain facets (Bond, Equity) con lógica específica de instrumento.

**Layer 3**: Jurisdiction-specific (bondUSA/, equityUSA/) con reglas regulatorias.

## COMMANDS

```bash
# Build
npm run ats:contracts:build      # Compile + TypeChain
npm run compile                  # Hardhat compile only

# Test
npm run ats:contracts:test       # All contract tests
npm run test:parallel            # Parallel execution
npm run test:coverage            # Coverage report

# Deployment
npm run ats:contracts:deploy:newBlr:hedera:testnet
npm run checkpoint:show          # Resume after failure

# Analysis
npm run slither                  # Security analysis
npm run size                     # Contract size check
```

## NOTES

**Memory**: `NODE_OPTIONS='--max-old-space-size=8192'` for compilation.

**Checkpoint System**: Auto-resumes from failures, stores in `.checkpoint/`.

**Gas Reporter**: Output in `gasReporterOutput.json` - exclude from commits.

**Slither**: Docker-based analysis, requires Docker running.
