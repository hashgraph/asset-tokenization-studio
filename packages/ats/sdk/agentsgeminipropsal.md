# AGENTS.md — ATS SDK (Proposed)

## Project Overview

TypeScript SDK for the Asset Tokenization Studio, enabling interaction with tokenized assets on Hedera.

- **Node.js:** v20.19.4+
- **Architecture:** Hexagonal Architecture + DDD + CQRS.
- **DI Container:** `tsyringe` (`reflect-metadata` required).
- **Web3 Library:** Ethers v6.

## Architecture & Layout

### Input Ports (`src/port/in/`)

- **Role:** Entry points for the SDK (e.g., `EquityInPort`, `BondInPort`).
- **Responsibility:** Define service interfaces, handle request validation, and orchestrate via Buses.
- **Patterns:**
  - Use `@LogError` decorator for unified error logging.
  - Implement validation with `ValidatedRequest.handleValidation("RequestName", req)`.
  - Delegate logic to `CommandBus` or `QueryBus`.

### Application Layer (`src/app/usecase/`)

- **Commands (`command/`):** Write operations (e.g., `CreateEquityCommand`).
- **Queries (`query/`):** Read operations (e.g., `GetEquityDetailsQuery`).
- **Handlers:** Implementation logic in `*CommandHandler` or `*QueryHandler`.
- **DI:** Prefer `@lazyInject` for services and adapters to avoid circular dependencies and facilitate testing.

### Domain Layer (`src/domain/context/`)

- **Models:** Rich domain objects and aggregates (e.g., `Security`, `EquityDetails`).
- **Value Objects:** Strongly typed identifiers like `ContractId`, `EvmAddress`, and `BigDecimal`.
- **Errors:** Domain-specific exceptions (e.g., `InvalidRequest`, `CreateEquityCommandError`).

### Infrastructure & Services

- **`TransactionService`:** Handles transaction execution via various providers (Hedera SDK, Fireblocks, etc.).
- **`ContractService`:** Manages EVM address resolution and contract interactions.
- **`MirrorNodeAdapter` (`src/port/out/mirror/`):** Outbound port for Hedera network introspection.

## Coding Standards & Conventions

### Technical Mandates

- **Ethers v6:** Use `bigint` for amounts, `contract.target` for addresses. Prohibited: Ethers v5 patterns.
- **Strong Typing:** Avoid `any`. Use domain Value Objects for addresses and IDs.
- **Hexagonal Integrity:** Domain models must not depend on infrastructure adapters.

### Testing (Jest)

- **Unit Tests:** `*.unit.test.ts` files located alongside the implementation.
- **Integration Tests:** Comprehensive flows in `__tests__/`.
- **Descriptions:** Use GIVEN/WHEN/THEN pattern in `it` blocks.
- **Mocks:** Use `@golevelup/ts-jest` for deep mocking of injected services.

## Development Workflow

- **DCO & GPG:** All commits must include `Signed-off-by` and GPG signature.
- **Conventional Commits:** Use `feat(ats:sdk):`, `fix(ats:sdk):`, etc.
- **Changesets:** Required for any change affecting the public API.

## Operational Workflows (Gemini-Specific)

### Research Phase (Surgical Search)

- **Locating Domain Logic:** When asked about a feature, search in parallel:
  - `grep_search pattern="FeatureName" include_pattern="src/port/in/**"` (Interface)
  - `grep_search pattern="FeatureName" include_pattern="src/app/usecase/**"` (Logic)
  - `grep_search pattern="FeatureName" include_pattern="src/domain/context/**"` (Model)
- **Dependency Tracking:** Check `tsyringe` registrations in `src/index.ts` or `src/core/` to understand how components are wired.

### Implementation Phase

- **Boilerplate Generation:** When creating a new command:
  1. Create the `Command.ts` (DTO).
  2. Create the `CommandHandler.ts` (Logic).
  3. Register in the `CommandBus` if necessary.
- **Verification:** Always check for `*.unit.test.ts` first. If missing, create one mirroring the structure of `CreateEquityCommandHandler.unit.test.ts`.

### Documentation Sync

- After major changes to the public API (Input Ports), trigger the `update-docs` skill to ensure the `/docs` folder stays synchronized.

## Key Commands

- `npm run build`: Build ESM and CJS distributions.
- `npm run test`: Execute all tests (run in band for stability).
- `npx jest <path>`: Run targeted tests during development.
- `npm run lint:fix`: Auto-fix linting and formatting issues.

---

_Note: This file is optimized for JIT (Just-In-Time) context loading in Gemini CLI. For global monorepo rules, refer to the root GEMINI.md._
