---
"@hashgraph/asset-tokenization-contracts": patch
---

docs(contracts): restructure and expand the ATS contracts developer documentation.

- Split large monolithic pages (`overview.md`, `upgrading.md`, `deployment.md`, `hash-codegen-validation.md`) into focused, single-purpose pages.
- Added new pages: `architecture`, `core-concepts`, `getting-started`, `repository-structure`, `roles-and-permissions`, `glossary`, `creating-an-asset-type`, `deploying-an-asset-proxy`, `deployment-workflows`, `downstream-deployment-utils`, `upgrading-configurations`, `upgrading-infrastructure`, `checkpoints-and-recovery`, `hash-codegen`, `erc-3643-compatibility`, `scheduled-tasks-force-cancel`, `testing`.
- Renamed `adding-facets.md` → `adding-a-facet.md` and `BLR.md` → `managing-the-blr.md`.
- Updated `packages/ats/contracts/README.md` and `scripts/DEVELOPER_GUIDE.md` for accuracy and alignment with the new structure.
- Updated the Docusaurus sidebar (`sidebars-ats.ts`) to reflect the new hierarchy.
