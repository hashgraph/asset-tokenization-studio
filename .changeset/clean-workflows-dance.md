---
"@hashgraph/asset-tokenization-contracts": patch
---

Cleanup and standardize GitHub Actions workflows:

- Adopt Hiero naming convention: `ddd-xxxx-<name>.yaml` with `ddd: [XXXX] <Name>` workflow names
- Standardize bash syntax: `[[ ]]` double brackets, `==` comparisons, `${VAR}` braces
- Fix `$GITHUB_OUTPUT` quoting inconsistencies in publish workflows
- Fix `if: always()` to `if: ${{ always() }}` expression syntax
- Remove unnecessary PR formatting triggers that wasted CI runner minutes
- Fix assignee check for security (expression injection prevention)
- Delete obsolete backup workflow files (fully commented-out dead code)
- Update cross-references in README.md, ci-cd-workflows.md, and CLAUDE.md
