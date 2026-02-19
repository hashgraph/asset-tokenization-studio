# contracts/ — Directory Structure

## Quick Reference

| Folder            | What                      | Purpose                                         |
| ----------------- | ------------------------- | ----------------------------------------------- |
| `facets/`         | Diamond facet contracts   | Entry points the proxy delegates to             |
| `lib/`            | Shared Solidity libraries | Business logic that facets call into            |
| `infrastructure/` | Diamond pattern core      | BLR, proxies, generic utilities (extractable)   |
| `storage/`        | Storage definitions       | Structs + free function accessors               |
| `constants/`      | Constants                 | Roles, storage positions, values, resolver keys |
| `factory/`        | Deployment                | Token factory and deployment helpers            |

## facets/ — organized by business domain

- **features/** — Security token features (ERC1400, access control, hold, lock, freeze, etc.)
- **assetCapabilities/** — Financial instrument capabilities (interest rates, KPIs, scheduled tasks)
- **regulation/** — Jurisdiction-specific rules (USA bond/equity regulation)

Each feature area contains a `FacetBase` + 4 rate variants (standard, fixedRate, kpiLinkedRate, sustainabilityPerformanceTargetRate).

## lib/ — organized by dependency layer

- **core/** — Security token fundamentals (access, pause, compliance, control lists, signing)
- **domain/** — Business domain (ERC standards, bonds, equity, financial instruments)
- **orchestrator/** — Cross-cutting compositions (token transfers, hold/clearing operations)

Dependency direction: core → domain → orchestrator (never reversed).

## Where to put new code

| Adding a...        | Put it in...                                  |
| ------------------ | --------------------------------------------- |
| New facet          | `facets/{area}/`                              |
| New library        | `lib/{layer}/` (respect dependency direction) |
| New storage struct | `storage/`                                    |
| New interface      | `facets/{area}/interfaces/`                   |
| New constant       | `constants/`                                  |
| Generic utility    | `infrastructure/lib/`                         |
