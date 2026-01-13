# Update Documentation

**Command:** `/update-docs`

**Description:** Automatically updates project documentation based on implemented Enhancement Proposals (EPs), accepted Architecture Decision Records (ADRs), and recent commits. This includes updating user guides, developer guides, architecture documentation, API references, and CHANGELOGs.

---

## Usage

```bash
# Update docs for all recently implemented features and accepted ADRs
/update-docs

# Update docs for a specific EP
/update-docs --ep 0001

# Update docs for a specific ADR
/update-docs --adr 0002

# Update docs based on recent commits (last N commits)
/update-docs --commits 10

# Update docs for a specific scope
/update-docs --scope ats
/update-docs --scope mass-payout

# Dry run (show what would be updated without making changes)
/update-docs --dry-run

# Update docs for both EP and ADR
/update-docs --ep 0003 --adr 0005
```

---

## What This Skill Does

This skill automates documentation updates by:

1. **Scanning Enhancement Proposals (EPs)**
   - Finds EPs with status: `Implemented` or `🚀 Implemented`
   - Extracts feature details from the EP
   - Identifies which documentation sections need updates

2. **Scanning Architecture Decision Records (ADRs)**
   - Finds ADRs with status: `Accepted` or `✅ Accepted`
   - Extracts architectural decisions and their implications
   - Identifies which developer guides and architecture docs need updates
   - Determines if setup/prerequisites changed

3. **Reviewing Recent Commits**
   - Analyzes commit messages for feature additions
   - Identifies changed files to understand scope
   - Extracts relevant implementation details
   - Collects commit hashes for CHANGELOG entries

4. **Reviewing and Updating CHANGELOGs**
   - **IMPORTANT**: Reads existing CHANGELOGs to understand current state
   - Identifies which packages are affected
   - Determines change type (Major/Minor/Patch)
   - Adds properly formatted entries with commit hashes
   - Includes EP or ADR references where applicable
   - Ensures version consistency across packages
   - Validates breaking changes include migration notes

5. **Updating Documentation**
   - Updates user guides with new features (from EPs)
   - Updates developer guides with architectural patterns (from ADRs)
   - Updates architecture overviews (from ADRs)
   - Updates API documentation
   - Updates getting started guides if setup changed (from ADRs)
   - Creates or updates "What's New" sections
   - Updates README files if needed

6. **Generating Summary**
   - Creates a summary of all documentation changes
   - Lists all files modified (including all CHANGELOGs)
   - Shows CHANGELOG entries added with EP/ADR references
   - Provides a checklist for manual review

---

## Instructions for Claude

When this skill is invoked, follow these steps:

### Step 1: Discovery Phase

1. **Check for Enhancement Proposals (EPs)**
   - Look in `docs/references/proposals/` for EP files
   - Filter EPs with status: `Implemented` or `🚀 Implemented`
   - Read each implemented EP to understand:
     - Feature name and scope (ATS, Mass Payout, SDK, Global)
     - What was implemented
     - UI/UX changes
     - API changes
     - Documentation requirements mentioned in the EP

2. **Check for Architecture Decision Records (ADRs)**
   - Look in `docs/references/adr/` for ADR files
   - Filter ADRs with status: `Accepted` or `✅ Accepted`
   - Read each accepted ADR to understand:
     - Architectural decision made and scope (ATS, Mass Payout, SDK, Global)
     - Context and problem statement
     - Decision outcome and rationale
     - Consequences (positive and negative impacts)
     - Technologies/patterns chosen
     - Documentation requirements implied by the decision
   - ADRs often require updates to:
     - Architecture overview documents
     - Developer guides (explaining new patterns/technologies)
     - API documentation (if APIs changed)
     - Getting started guides (if setup/prerequisites changed)
     - CHANGELOG (architectural changes can be Major or Minor)

3. **Review Recent Commits (if --commits flag provided)**
   - Use `git log` to get recent commits
   - Look for commits with keywords: `feat:`, `feature:`, `add:`, `implement:`
   - Identify scope from file paths (ats, mass-payout, sdk, contracts)
   - Extract feature descriptions from commit messages
   - Note commit hashes for CHANGELOG entries

3. **Review Existing CHANGELOGs**
   - Locate CHANGELOGs based on scope:
     - ATS Contracts: `packages/ats/contracts/CHANGELOG.md`
     - ATS SDK: `packages/ats/sdk/CHANGELOG.md`
     - Mass Payout Contracts: `packages/mass-payout/contracts/CHANGELOG.md`
     - Mass Payout SDK: `packages/mass-payout/sdk/CHANGELOG.md`
     - Mass Payout Backend: `apps/mass-payout/backend/CHANGELOG.md` (if exists)
     - Mass Payout Frontend: `apps/mass-payout/frontend/CHANGELOG.md` (if exists)
   - Read existing CHANGELOG to:
     - Understand current version number
     - Match formatting style
     - Check if feature is already documented
     - Identify what category to use (Major/Minor/Patch)

4. **Identify Scope**
   - Determine if changes affect:
     - ATS (Asset Tokenization Studio)
     - Mass Payout
     - SDK (either ATS SDK or Mass Payout SDK)
     - Contracts (smart contracts)
     - Global (affects entire monorepo)
   - Map scope to specific CHANGELOGs to update

### Step 2: Analysis Phase

1. **Map Features to Documentation**

   For each implemented feature, determine which documentation files need updates:

   **User-Facing Features:**
   - `docs/{scope}/user-guides/` - Add new guides or update existing ones
   - `docs/{scope}/intro.md` - Update features list if major feature
   - `docs/{scope}/getting-started/` - Update if affects setup or quick start

   **Developer-Facing Features:**
   - `docs/{scope}/developer-guides/` - Add technical implementation details
   - `docs/{scope}/api/` - Update API reference
   - `README.md` (root or package) - Update if affects installation or setup
   - `CHANGELOG.md` - Add entry with version and changes

   **Contract Changes:**
   - `docs/{scope}/developer-guides/contracts/` - Update contract documentation
   - `docs/{scope}/api/contracts/` - Update contract API reference

   **SDK Changes:**
   - `docs/{scope}/developer-guides/sdk-*.md` - Update SDK guides
   - `docs/{scope}/api/sdk-reference.md` - Update SDK API reference

2. **Read Existing Documentation**
   - Read the identified documentation files
   - Understand the current structure and style
   - Identify where new content should be inserted

### Step 3: Update Phase

For each documentation file that needs updating:

1. **User Guides**
   - Add new step-by-step guides for new features
   - Update existing guides if feature modifies existing flows
   - Include screenshots placeholders: `![Feature Name](../../images/feature-name.png)`
   - Follow existing format and style
   - Add to index pages with card boxes if applicable

2. **Developer Guides**
   - Add technical implementation details
   - Include code examples
   - Document new architecture patterns
   - Update architecture diagrams (mermaid) if needed
   - Add deployment instructions if needed

3. **API Documentation**
   - Document new endpoints (REST API)
   - Document new contract functions
   - Document new SDK methods
   - Include request/response examples
   - Add code snippets

4. **Getting Started Guides**
   - Update prerequisites if needed
   - Add new environment variables
   - Update configuration steps
   - Add troubleshooting entries for common issues

5. **Intro/Index Pages**
   - Update feature lists in card boxes
   - Update use cases if applicable
   - Update architecture diagrams if needed
   - Update system requirements if changed

6. **CHANGELOG**
   - **Location**: Each package has its own CHANGELOG (e.g., `packages/ats/contracts/CHANGELOG.md`, `packages/mass-payout/sdk/CHANGELOG.md`)
   - **Format**: This project uses Changesets format
   - **Structure**:
     ```markdown
     ## [Version Number]

     ### Major Changes (Breaking changes)
     - [commit-hash]: Description of breaking change

     ### Minor Changes (New features)
     - [commit-hash]: Description of new feature

     ### Patch Changes (Bug fixes)
     - [commit-hash]: Description of bug fix
     ```
   - **Guidelines**:
     - Add entries at the top (most recent first)
     - Use commit hash for traceability
     - Be specific and clear about what changed
     - Reference EP or ADR if applicable: `(EP-0003)` or `(ADR-0002)`
     - For architectural changes from ADRs, reference the ADR
     - For breaking changes, explain migration path
     - Group related changes together
   - **Review existing CHANGELOG** to match formatting and style
   - **Determine change type**:
     - Major: Breaking API changes, removed features, incompatible changes
     - Minor: New features, new APIs, enhancements (backward compatible)
     - Patch: Bug fixes, documentation updates, refactoring

### Step 4: Validation Phase

1. **Check Internal Links**
   - Verify all internal links use `.md` extensions
   - Ensure links point to existing files
   - Fix any broken links found

2. **Check Consistency**
   - Ensure terminology is consistent with existing docs
   - Verify code examples follow project conventions
   - Check that formatting matches existing docs

3. **Validate CHANGELOG Entries**
   - Verify each CHANGELOG has been updated for affected packages
   - Check that version numbers are consistent
   - Ensure commit hashes are included and correct
   - Verify categorization (Major/Minor/Patch) is appropriate
   - Confirm formatting matches existing entries
   - Check that breaking changes include migration guidance
   - Verify EP references are included where applicable

4. **Create Summary**
   - List all files modified (including all CHANGELOGs)
   - Summarize key changes made
   - Show which CHANGELOGs were updated with what entries
   - Provide checklist of items that need manual review:
     - [ ] Screenshots need to be added
     - [ ] Code examples need testing
     - [ ] Links need verification
     - [ ] Version numbers need updating (if not already versioned)
     - [ ] CHANGELOG entries are accurate
     - [ ] Breaking changes have migration notes

### Step 5: Output Phase

1. **Present Changes**
   - Show summary of documentation updates
   - List modified files
   - Highlight any manual steps needed

2. **Suggest Next Steps**
   - Run docs locally to verify formatting
   - Add missing screenshots
   - Test code examples
   - Review and commit changes

---

## Examples

### Example 1: Update docs for implemented EP

```
User: /update-docs --ep 0003

Claude:
I'll update the documentation for EP-0003: Scheduled Distributions.

Discovery Phase:
✓ Found EP: docs/references/proposals/0003-mp-scheduled-distributions.md
✓ Status: 🚀 Implemented
✓ Scope: Mass Payout
✓ Feature: Automatic recurring distributions with cron-like scheduling
✓ Affected packages: Backend (NestJS), SDK

Review CHANGELOGs:
✓ Read packages/mass-payout/sdk/CHANGELOG.md (current version: 1.1.0)
✓ Read apps/mass-payout/backend/CHANGELOG.md (current version: 1.1.5)
✓ Change type: Minor (new feature, backward compatible)

Analysis Phase:
Documentation files to update:
- docs/mass-payout/user-guides/creating-distributions.md (add scheduling section)
- docs/mass-payout/user-guides/index.md (add scheduled distributions card)
- docs/mass-payout/intro.md (update features and use cases)
- docs/mass-payout/developer-guides/backend/architecture.md (add scheduling service)
- packages/mass-payout/sdk/CHANGELOG.md (add minor change entry)
- apps/mass-payout/backend/CHANGELOG.md (add minor change entry)

[Proceeds to update each file...]

Update Phase:
✓ Updated user guides with scheduling steps
✓ Updated architecture docs with CronService component
✓ Updated intro.md use cases
✓ Added CHANGELOG entries:
  - packages/mass-payout/sdk/CHANGELOG.md:
    ### Minor Changes
    - a1b2c3d: Add scheduled and recurring distribution support (EP-0003)
  - apps/mass-payout/backend/CHANGELOG.md:
    ### Minor Changes
    - a1b2c3d: Implement CronService for automatic payout execution (EP-0003)

Summary of Changes:
✓ Updated 6 files (4 docs + 2 CHANGELOGs)
✓ Added "Scheduled Distributions" section to user guide
✓ Updated architecture diagram with CronService
✓ Updated CHANGELOGs with Minor Changes entries

Manual Steps Needed:
- [ ] Add screenshots for scheduled distribution UI
- [ ] Test cron expression examples
- [ ] Verify all links work in deployed docs
- [ ] Confirm version numbers before release

Would you like me to commit these changes?
```

### Example 2: Update docs based on recent commits

```
User: /update-docs --commits 20 --scope ats

Claude:
Analyzing last 20 commits in ATS scope...

Found relevant commits:
1. e0a3f03: feat(ats): add multi-signature approval for transfers
2. a1b2c3d: feat(contracts): add freeze reason parameter
3. c4d5e6f: feat(sdk): add batch transfer method

Review CHANGELOGs:
✓ Read packages/ats/contracts/CHANGELOG.md (current version: 2.0.0)
✓ Read packages/ats/sdk/CHANGELOG.md (current version: 2.1.0)
✓ Changes found:
  - Multi-sig approval: Major (breaking change in approval flow)
  - Freeze reason: Minor (new parameter, backward compatible)
  - Batch transfer: Minor (new method)

Analysis Phase:
Documentation to update:
- docs/ats/user-guides/transfer-restrictions.md (multi-sig section)
- docs/ats/user-guides/freeze-tokens.md (freeze reason parameter)
- docs/ats/developer-guides/sdk-integration.md (batch transfer examples)
- packages/ats/contracts/CHANGELOG.md (add major + minor changes)
- packages/ats/sdk/CHANGELOG.md (add minor change)

[Proceeds with documentation updates...]

Update Phase:
✓ Updated CHANGELOGs:
  - packages/ats/contracts/CHANGELOG.md:
    ## 3.0.0
    ### Major Changes
    - e0a3f03: Multi-signature approval required for restricted transfers
      Migration: Update your transfer flows to include approval step

    ### Minor Changes
    - a1b2c3d: Add optional reason parameter to freeze methods

  - packages/ats/sdk/CHANGELOG.md:
    ## 2.2.0
    ### Minor Changes
    - c4d5e6f: Add batchTransfer method for efficient multi-recipient transfers

Summary:
✓ Updated 5 files (3 docs + 2 CHANGELOGs)
✓ Documented breaking change with migration notes
✓ Added code examples for new features
✓ Version bump: contracts 2.0.0 → 3.0.0 (major), sdk 2.1.0 → 2.2.0 (minor)
```

### Example 3: Update docs based on accepted ADR

```
User: /update-docs --adr 0002

Claude:
I'll update the documentation for ADR-0002: Adopt GraphQL for Mass Payout API.

Discovery Phase:
✓ Found ADR: docs/references/adr/0002-adopt-graphql-api.md
✓ Status: ✅ Accepted
✓ Scope: Mass Payout (Backend)
✓ Decision: Replace REST API with GraphQL using Apollo Server
✓ Consequences:
  - More flexible queries for frontend
  - Breaking change for existing API consumers
  - New dependencies (Apollo Server, GraphQL)

Review CHANGELOGs:
✓ Read apps/mass-payout/backend/CHANGELOG.md (current version: 1.5.0)
✓ Change type: Major (breaking API change)

Analysis Phase:
Documentation to update:
- docs/mass-payout/developer-guides/backend/architecture.md (add GraphQL layer)
- docs/mass-payout/developer-guides/backend/index.md (update API section)
- docs/mass-payout/getting-started/full-setup.md (new GraphQL playground URL)
- docs/mass-payout/api/rest-api/index.md (deprecation notice + migration guide)
- docs/mass-payout/api/graphql/ (NEW: create GraphQL API documentation)
- apps/mass-payout/backend/CHANGELOG.md (add major change)

[Proceeds with documentation updates...]

Update Phase:
✓ Updated architecture docs with GraphQL layer diagram
✓ Added GraphQL schema documentation
✓ Created migration guide from REST to GraphQL
✓ Updated getting started with GraphQL playground URL
✓ Added deprecation notices to REST API docs
✓ Updated CHANGELOG:
  - apps/mass-payout/backend/CHANGELOG.md:
    ## 2.0.0
    ### Major Changes
    - b3c4d5e: Migrate from REST to GraphQL API (ADR-0002)

      BREAKING CHANGE: REST API endpoints are deprecated and will be removed in v3.0.0

      Migration Guide:
      - Use GraphQL endpoint at /graphql instead of /api
      - See docs/mass-payout/api/graphql/ for new schema
      - REST endpoints remain available but are deprecated

Summary:
✓ Updated 6 files (5 docs + 1 CHANGELOG)
✓ Created new GraphQL API documentation section
✓ Added migration guide for breaking change
✓ Updated architecture diagram with GraphQL layer
✓ Version bump: backend 1.5.0 → 2.0.0 (major)

Manual Steps Needed:
- [ ] Test GraphQL examples in documentation
- [ ] Verify GraphQL playground URL is correct
- [ ] Add GraphQL schema visualization diagram
- [ ] Update frontend integration examples
- [ ] Confirm deprecation timeline with team
```

---

## Special Cases

### No Implemented EPs or Accepted ADRs Found
If no implemented EPs or accepted ADRs are found, check recent commits with feature additions and architectural changes. Suggest:
- Creating an EP retroactively for implemented features
- Creating an ADR retroactively for architectural decisions made
- Updating docs based on commit analysis only

### Multiple Scopes Affected
If a feature affects multiple scopes (e.g., both ATS and Mass Payout), update documentation in all affected areas and all relevant CHANGELOGs.

### Breaking Changes
If the EP or commits indicate breaking changes:
- Categorize as "Major Changes" in CHANGELOG
- Add prominent warning boxes in affected documentation
- Include migration path in CHANGELOG entry
- Update migration guides in documentation
- Increment major version number (e.g., 2.0.0 → 3.0.0)

### CHANGELOG Already Updated
If the CHANGELOG already has an entry for the feature:
- Review the entry for completeness
- Check if it needs more detail
- Verify the categorization (Major/Minor/Patch) is correct
- Update if needed, but avoid duplicates

### Missing CHANGELOG Files
If a package doesn't have a CHANGELOG:
- Create one using the Changesets format
- Start with version 1.0.0 (or current package.json version)
- Add a header comment explaining the format

### New Architecture Patterns (from ADRs)
When ADRs introduce new architectural patterns:
- **Priority**: ADRs often have higher documentation priority for developer guides
- Update architecture overview documents first
- Add mermaid diagrams showing new patterns/layers
- Update developer guides with pattern explanation and examples
- Update getting started if prerequisites/setup changed
- Document in CHANGELOG as Minor or Major depending on impact
- If breaking change, provide migration guide from old to new pattern

### ADRs with Infrastructure Changes
If an ADR changes infrastructure (databases, deployment, CI/CD):
- Update getting started guides
- Update system requirements
- Update deployment documentation
- Add migration/upgrade guides
- Update environment configuration examples

---

## Configuration

This skill looks for the following:

**Enhancement Proposals:**
- Location: `docs/references/proposals/*.md`
- Status patterns: `Implemented`, `🚀 Implemented`

**Architecture Decision Records:**
- Location: `docs/references/adr/*.md`
- Status patterns: `Accepted`, `✅ Accepted`

**Documentation Structure:**
```
docs/
├── ats/
│   ├── intro.md
│   ├── getting-started/
│   ├── user-guides/
│   ├── developer-guides/
│   └── api/
├── mass-payout/
│   ├── intro.md
│   ├── getting-started/
│   ├── user-guides/
│   ├── developer-guides/
│   └── api/
└── references/
    └── proposals/
```

---

## Notes

- This skill creates or updates documentation files but does NOT commit them automatically
- Always review generated documentation before committing
- Screenshots and diagrams referenced in docs need to be added manually
- Code examples should be tested before finalizing
- Internal links should be verified after updates
- The skill follows existing documentation style and conventions

---

## Related Skills

- `/review-pr` - Review pull requests including documentation changes
- `/create-ep` - Create a new Enhancement Proposal
