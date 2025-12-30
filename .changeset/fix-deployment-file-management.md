---
"@hashgraph/asset-tokenization-contracts": minor
---

Centralize deployment file management and enhance for downstream consumption:

**Bug Fixes & Refactoring:**

- Fixed critical variable shadowing bug in filename extraction
- Added cross-platform path handling (Unix/Windows)
- Eliminated 240 lines of duplicated code across workflow files
- Centralized deployment file utilities in infrastructure layer
- Added TDD regression tests to prevent future bugs

**New Features (Downstream Enhancement):**

- Made `WorkflowType` fully extensible: changed from `AtsWorkflowType | (string & Record<string, never>)` to `AtsWorkflowType | string`
- Made deployment output types fully extensible by removing generic constraint
- Added type guards: `isSaveSuccess()`, `isSaveFailure()`, `isAtsWorkflow()`
- Added `registerWorkflowDescriptor()` for custom workflow naming
- Updated `generateDeploymentFilename()` with descriptor registry fallback
- Added comprehensive downstream usage documentation to README
- Exported `ATS_WORKFLOW_DESCRIPTORS` and new utility functions

**Breaking Changes:**

- `WorkflowType`: Simplified from complex intersection to clean union `AtsWorkflowType | string`
- `SaveDeploymentOptions<T>` and `saveDeploymentOutput<T>()` now accept any type (removed `extends AnyDeploymentOutput` constraint)
- These changes enable downstream projects to use custom workflows and output types without type assertions
- ATS workflows maintain full type safety through literal types and default type parameters

Enables downstream projects (like GBP) to extend ATS deployment utilities with custom workflows and output types while maintaining type safety and backward compatibility.
