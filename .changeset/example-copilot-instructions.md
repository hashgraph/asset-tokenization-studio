---
# Example changeset for documentation-only changes
#
# This file is an example showing how to create a changeset when a change
# affects one or more packages. For documentation-only changes you normally
# DO NOT need a changeset; create one only if your change also modifies
# published package code or types.

# Example frontmatter for actual package releases (uncomment and edit when needed):
# ---
# '@hashgraph/asset-tokenization-sdk': patch
# '@hashgraph/asset-tokenization-contracts': patch
# ---

Docs: add Copilot instructions and .env.sample files for local development.

Run locally to create a real changeset (interactive):

```bash
npx changeset
```

Or create a file in `.changeset/*.md` with the frontmatter above and a short
description. See https://github.com/changesets/changesets for details.
