---
name: scaffold-sdk-feature
description: >
  Scaffold an empty end-to-end CQRS feature (command or query) in
  packages/ats/sdk: request DTO, command/query class, handler, response or
  view-model, error class and co-located unit test. Wires the handler into
  src/core/injectable/Handlers.ts and appends a facade method in
  src/port/in/<domain>/<Domain>.ts decorated with @LogError and using
  ValidatedRequest.handleValidation. If the target domain directory does
  not exist yet, the skill prompts the user to create it before scaffolding
  the feature. Use when the user asks to scaffold, bootstrap, stub or
  generate a new use case (command/query) in the ATS SDK.
license: Apache-2.0
metadata:
  author: hashgraph
  version: "0.1"
---

# Scaffold SDK Feature

Scaffolds a CQRS feature skeleton inside `packages/ats/sdk`. Files are
created **empty but compiling**: handler bodies throw `not implemented`,
unit tests use `it.todo`, errors carry `ErrorCode.TODO`. The project must
build after the skill runs; only the new feature should fail at runtime.

This skill enforces the conventions documented in
`packages/ats/sdk/AGENTS.md`. Do not improvise — copy shape from existing
siblings and only change names.

## When to use

Trigger when the user asks to "scaffold", "bootstrap", "stub", "create the
skeleton of", or "start" a new command or query in the ATS SDK. Example
prompts:

- "scaffold a `redeemCouponEarly` command in the bond domain"
- "stub a query `getDividendByHolder` for dividend"
- "create a new feature `setMaxSupply` for security"

Do **not** use this skill to rename, refactor or modify an existing
feature.

## Inputs

Collect all three from the user before doing anything else. If any is
missing, ask the user (use the host agent's user-prompt mechanism, e.g.
`AskUserQuestion` in Claude Code). Do not assume defaults.

1. **kind** — `command` or `query`.
2. **domain** — lowercase, e.g. `bond`, `equity`, `coupon`, `dividend`,
   `security`, `account`.
3. **action** — camelCase identifier, e.g. `createBondExtension`,
   `getCouponByHolder`, `setMaxSupply`. Reject anything that is not a
   valid camelCase TypeScript identifier.

Derive identifiers from `action`. With `action = createBondExtension`:

| Symbol                       | Value                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| Action class base (`{Pascal}`) | `CreateBondExtension`                                                            |
| Command/Query class          | `CreateBondExtensionCommand` or `CreateBondExtensionQuery`                         |
| Handler                      | `CreateBondExtensionCommandHandler` or `CreateBondExtensionQueryHandler`           |
| Response (command)           | `CreateBondExtensionCommandResponse` (co-located with handler)                     |
| Response (query)             | `CreateBondExtensionViewModel` (in `port/in/response/<domain>/`)                   |
| Error                        | `CreateBondExtensionCommandError` or `CreateBondExtensionQueryError`               |
| Request                      | `CreateBondExtensionRequest` (in `port/in/request/<domain>/`)                      |
| Folder under usecase         | `<domain>/createBondExtension/` (camelCase, same as `action`)                      |
| Domain facade class (`{Domain}`) | `Bond` (PascalCase of `domain`)                                                |

## Step 1 — Verify or create the domain

Check whether `packages/ats/sdk/src/port/in/<domain>/<Domain>.ts` exists.

**If the domain does NOT exist**, ask the user explicitly:

> The domain `<domain>` does not exist in `src/port/in/`. Do you want to
> create it now? (yes / no)

If the user answers **no** (or anything other than yes), stop the skill.
Do not create files.

If the user answers **yes**, scaffold the domain:

1. Pick a small, existing domain as a shape reference (recommended:
   `src/port/in/account/`). Read the facade file in full to understand
   imports, decorators and the `getInstance()` static accessor.
2. Create directory `packages/ats/sdk/src/port/in/<domain>/`.
3. Create `src/port/in/<domain>/<Domain>.ts` mirroring the reference
   facade: same imports, `@singleton()` decorator, `@lazyInject(CommandBus)`
   and `@lazyInject(QueryBus)` members, the same `getInstance()` pattern.
   The class body must contain **no methods** — methods are added in
   Step 4 (or by future runs of this skill).
4. Create `src/port/in/<domain>/<Domain>.unit.test.ts` with a single
   `describe("{Domain}", () => { it.todo("…"); })`. Import
   `reflect-metadata` at the top, mirroring the reference test file.
5. Create empty directories (use a `.gitkeep` if the host agent's writer
   cannot create empty dirs):
   - `src/port/in/request/<domain>/`
   - `src/port/in/response/<domain>/`
   - `src/app/usecase/command/<domain>/`
   - `src/app/usecase/query/<domain>/`
6. Edit `src/port/in/index.ts`: add `export { {Domain} } from "./<domain>/<Domain>";`,
   preserving alphabetical order.
7. Edit `src/core/injectable/Handlers.ts`:
   - Declare `export const COMMAND_HANDLERS_<DOMAIN_UPPER>: Constructor<unknown>[] = [];`
   - Declare `export const QUERY_HANDLERS_<DOMAIN_UPPER>: Constructor<unknown>[] = [];`
   - Spread both into the aggregated `COMMAND_HANDLERS` /
     `QUERY_HANDLERS` exports (locate the existing pattern by reading
     the file).

When the domain has been scaffolded (or already existed), continue with
Step 2.

## Step 2 — Scaffold the feature files

Pick a sibling under the same `<domain>/<kind>/` directory as a shape
reference. If the domain has no other features yet, fall back to a
sibling in another domain (recommended: a small one like
`src/app/usecase/command/account/createAccount/` or
`src/app/usecase/query/account/getAccountInfo/`).

Read the reference files first; copy imports, decorators, class shape.
Replace identifiers only. Do not invent fields, dependencies, error
codes or implementation logic.

### When `kind == command`

Create in this order:

1. `src/port/in/request/<domain>/{Pascal}Request.ts`
   - Class extending the reference's request base (typically
     `ValidatedArgs` or `BaseArgs`).
   - Fields: a single `// TODO: declare request fields` comment.
2. `src/app/usecase/command/<domain>/<action>/{Pascal}Command.ts`
   - `class {Pascal}Command extends Command<{Pascal}CommandResponse>`
   - Constructor with a single `// TODO: declare command parameters`
     comment.
3. `src/app/usecase/command/<domain>/<action>/{Pascal}CommandResponse.ts`
   - Empty class.
4. `src/app/usecase/command/<domain>/<action>/error/{Pascal}CommandError.ts`
   - Extends `BaseError`.
   - Constructor calls `super(ErrorCode.TODO, "TODO: describe error");`
5. `src/app/usecase/command/<domain>/<action>/{Pascal}CommandHandler.ts`
   - Decorated with `@CommandHandler({Pascal}Command)`.
   - Implements `ICommandHandler<{Pascal}Command>`.
   - `execute()` body: `throw new Error("Not implemented: {Pascal}CommandHandler");`
6. `src/app/usecase/command/<domain>/<action>/{Pascal}CommandHandler.unit.test.ts`
   - `import "reflect-metadata";` first line.
   - `describe("{Pascal}CommandHandler", () => { it.todo("should …"); });`

### When `kind == query`

Same shape with these differences:

- `{Pascal}Query.ts` extends `Query<{Pascal}ViewModel>`.
- Handler: `{Pascal}QueryHandler.ts`, decorated `@QueryHandler({Pascal}Query)`,
  implements `IQueryHandler<{Pascal}Query>`.
- **Response file lives in**
  `src/port/in/response/<domain>/{Pascal}ViewModel.ts` — NOT co-located
  with the handler. This split is load-bearing.
- Error: `src/app/usecase/query/<domain>/<action>/error/{Pascal}QueryError.ts`.
- Test: `{Pascal}QueryHandler.unit.test.ts`.

## Step 3 — Register the handler

Edit `packages/ats/sdk/src/core/injectable/Handlers.ts`:

- Add `import { {Pascal}{Command|Query}Handler } from "@command/.../{Pascal}{Command|Query}Handler";`
  (use the matching `@command/` or `@query/` alias).
- Append the handler class to the matching array:
  - Commands → `COMMAND_HANDLERS_<DOMAIN_UPPER>`
  - Queries → `QUERY_HANDLERS_<DOMAIN_UPPER>`

This step is mandatory. The CommandBus / QueryBus discover handlers
through these arrays at construction time; an unregistered handler
fails at runtime with no compile-time warning.

## Step 4 — Add the facade method

Edit `packages/ats/sdk/src/port/in/<domain>/<Domain>.ts`. Append one
method (replace placeholders accordingly):

```ts
@LogError
public async {action}(req: {Pascal}Request): Promise<{ResponseType}> {
  ValidatedRequest.handleValidation("{Pascal}Request", req);
  return await this.{bus}.execute(
    new {Pascal}{Command|Query}(/* TODO: map req fields */),
  );
}
```

Where:

- `{ResponseType}` is `{Pascal}CommandResponse` (command) or
  `{Pascal}ViewModel` (query).
- `{bus}` is `commandBus` or `queryBus`.
- The string passed to `handleValidation` **must** be the request class
  name verbatim — port unit tests assert this string.

Add the necessary imports using `@command/`, `@query/`, `@port/`,
`@core/` aliases. Do not use deep relative paths.

## Step 5 — Print these reminders

After all files are written and edits applied, output to the user:

- **ErrorCode placeholder.** The generated error class uses
  `ErrorCode.TODO`. Add a real entry to the `ErrorCode` enum in
  `packages/ats/sdk/src/core/error/ErrorCode.ts`, respecting the
  numeric ranges already in use (1XXXX, 2XXXX, 3XXXX, 4XXXX). Update
  the error class to reference it.
- **Changeset required.** The exported surface of `port/in/index.ts`
  changed (new method on `<Domain>` facade). Run `npm run changeset`
  at the repo root and describe the new method.
- **Human review required.** Any change in `packages/ats/sdk` must be
  reviewed and approved by a human before commit (see
  `packages/ats/sdk/AGENTS.md`).
- **Implementation TODOs.** Fill request fields, command/query
  constructor parameters, the handler body, and replace `it.todo` in
  the unit test with real cases.
- **Tests.** Run `npm run test:unit:diff` from `packages/ats/sdk` to
  exercise the new file once implementation begins.

## Failure modes — stop and report, do not proceed

- `action` is not a valid camelCase TypeScript identifier.
- Any target file already exists. Do not overwrite. Report the
  conflict and ask the user how to proceed.
- `Handlers.ts` cannot be parsed to locate the array (e.g. the array
  has been refactored away). Report the failed insertion point and
  stop. Do not silently skip the registration step.
- The host agent has no mechanism to prompt the user and `domain` is
  missing or non-existent. Stop with a clear error.

## Out of scope

- This skill does not implement business logic.
- This skill does not add an `ErrorCode` enum entry — only flags it.
- This skill does not run `npm run changeset` — only flags it.
- This skill does not commit changes.
