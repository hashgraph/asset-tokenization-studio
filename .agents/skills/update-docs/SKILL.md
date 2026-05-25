---
name: update-docs
description: Update project documentation based on recent commits. Use when the user asks to update, sync, or refresh docs after code changes.
---

# Update Documentation

Automatically update project documentation based on recent commits and code changes.

## Arguments

Parse the arguments provided in `$ARGUMENTS`:

- `commits=N` - Analyze last N commits (default: 10)
- `scope=X` - Update specific scope only (ats or mass-payout)
- `dry-run` - Preview changes without modifying files

Examples:

- `/update-docs` - Update all based on recent commits
- `/update-docs commits=20` - Analyze last 20 commits
- `/update-docs commits=5 scope=ats` - Last 5 commits, ATS scope only
- `/update-docs dry-run` - Preview changes without modifying files

## Context

Arguments provided by user: $ARGUMENTS

---

## What This Skill Does

This skill automates documentation updates by:

1. **Reviewing Recent Commits**
   - Analyzes commit messages for feature additions, fixes, and breaking changes
   - Identifies changed files to understand scope
   - Extracts relevant implementation details
   - Collects commit hashes for reference

2. **Reviewing CHANGELOGs (Read-Only for Context)**
   - **IMPORTANT**: Reads existing CHANGELOGs to understand current version and recent changes
   - Identifies which packages are affected by the feature
   - Notes what type of change this would be (Major/Minor/Patch)
   - **Does NOT modify CHANGELOGs** - this is a manual task for the user

3. **Updating Documentation**
   - Updates user guides with new features
   - Updates developer guides with architectural patterns
   - Updates architecture overviews
   - Updates API documentation
   - Updates getting started guides if setup changed
   - Creates or updates "What's New" sections
   - Updates README files if needed

4. **Generating Summary**
   - Creates a summary of all documentation changes
   - Lists all documentation files modified
   - Provides CHANGELOG update suggestions for manual entry
   - Provides a checklist for manual review

---

## Instructions for Claude

When this skill is invoked, follow these steps:

### Step 1: Discovery Phase

1. **Review Recent Commits**
   - Use `git log --oneline -N` to get recent commits (N from arguments or default 10)
   - Look for commits with keywords: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
   - Identify scope from commit scopes and file paths (ats, mass-payout, sdk, contracts)
   - Extract feature descriptions from commit messages
   - Note commit hashes for reference
   - Use `git diff` on relevant commits to understand actual code changes

2. **Review Existing CHANGELOGs (Read-Only for Context)**
   - Locate CHANGELOGs based on scope:
     - ATS Contracts: `packages/ats/contracts/CHANGELOG.md`
     - ATS SDK: `packages/ats/sdk/CHANGELOG.md`
     - Mass Payout Contracts: `packages/mass-payout/contracts/CHANGELOG.md`
     - Mass Payout SDK: `packages/mass-payout/sdk/CHANGELOG.md`
     - Mass Payout Backend: `apps/mass-payout/backend/CHANGELOG.md` (if exists)
     - Mass Payout Frontend: `apps/mass-payout/frontend/CHANGELOG.md` (if exists)
   - Read existing CHANGELOG to:
     - Understand current version number
     - Check if feature is already documented
     - Determine what category this change would be (Major/Minor/Patch)
   - **Important:** Do NOT modify CHANGELOGs - only read for context

3. **Identify Scope**
   - Determine if changes affect:
     - ATS (Asset Tokenization Studio)
     - Mass Payout
     - SDK (either ATS SDK or Mass Payout SDK)
     - Contracts (smart contracts)
     - Global (affects entire monorepo)

### Step 2: Analysis Phase

1. **Map Changes to Documentation**

   For each relevant commit, determine which documentation files need updates:

   **User-Facing Features (feat: commits):**
   - `docs/{scope}/user-guides/` - Add new guides or update existing ones
   - `docs/{scope}/intro.md` - Update features list if major feature
   - `docs/{scope}/getting-started/` - Update if affects setup or quick start

   **Developer-Facing Changes (refactor:, feat: in contracts/sdk):**
   - `docs/{scope}/developer-guides/` - Add technical implementation details
   - `docs/{scope}/api/` - Update API reference
   - `README.md` (root or package) - Update if affects installation or setup

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

2. **Developer Guides**
   - Add technical implementation details
   - Include code examples
   - Document new architecture patterns
   - Update architecture diagrams (mermaid) if needed

3. **API Documentation**
   - Document new endpoints (REST API)
   - Document new contract functions
   - Document new SDK methods
   - Include request/response examples

4. **Getting Started Guides**
   - Update prerequisites if needed
   - Add new environment variables
   - Update configuration steps

5. **Intro/Index Pages**
   - Update feature lists
   - Update use cases if applicable
   - Update architecture diagrams if needed

### Step 4: Validation Phase

1. **Check Internal Links**
   - Verify all internal links use `.md` extensions
   - Ensure links point to existing files
   - Fix any broken links found

2. **Check Consistency**
   - Ensure terminology is consistent with existing docs
   - Verify code examples follow project conventions
   - Check that formatting matches existing docs

3. **Create Summary**
   - List all documentation files modified
   - Summarize key changes made
   - Provide checklist of items that need manual review:
     - [ ] Screenshots need to be added
     - [ ] Code examples need testing
     - [ ] Links need verification
     - [ ] **CHANGELOGs need manual updates** (see suggestions below)

### Step 5: Output Phase

1. **Present Changes**
   - Show summary of documentation updates
   - List modified files
   - Highlight any manual steps needed

2. **Provide CHANGELOG Update Suggestions**
   - **Important:** Do NOT modify CHANGELOG files
   - Instead, provide suggestions for manual CHANGELOG updates:
     - Which CHANGELOG files need updates
     - Suggested change type (Major/Minor/Patch)
     - Suggested entry format with commit hash
     - Example entry the user can copy/paste
   - Format suggestion as:

     ```
     CHANGELOG Suggestions (Manual Update Required):

     packages/ats/contracts/CHANGELOG.md
     Type: Minor
     Suggested entry:
     ### Minor Changes
     - abc123d: Add freeze reason parameter

     packages/mass-payout/sdk/CHANGELOG.md
     Type: Major
     Suggested entry:
     ### Major Changes
     - def456e: Migrate to GraphQL API
       BREAKING CHANGE: REST endpoints deprecated
     ```

3. **Suggest Next Steps**
   - Update CHANGELOGs manually using suggestions above
   - Run docs locally to verify formatting: `npm run docs:start`
   - Add missing screenshots
   - Test code examples
   - Review and commit changes

---

## Special Cases

### No Relevant Commits Found

If no feature or fix commits are found in the range, report that no documentation updates are needed and suggest expanding the commit range.

### Multiple Scopes Affected

If commits affect multiple scopes (e.g., both ATS and Mass Payout), update documentation in all affected areas and provide CHANGELOG suggestions for all relevant packages.

### Breaking Changes

If commits indicate breaking changes:

- Add prominent warning boxes in affected documentation
- Create migration guides in documentation
- In CHANGELOG suggestions, recommend "Major Changes" category
- Include migration path in suggested CHANGELOG entry

### CHANGELOG Already Has Entry

If the CHANGELOG already has an entry for the feature:

- Note that it's already documented
- Skip CHANGELOG suggestions for this feature

### Missing CHANGELOG Files

If a package doesn't have a CHANGELOG:

- Note in the summary that CHANGELOG is missing
- Suggest creating one using Changesets format

---

## Configuration

**Documentation Structure:**

```
docs/
  ats/
    intro.md
    getting-started/
    user-guides/
    developer-guides/
    api/
  mass-payout/
    intro.md
    getting-started/
    user-guides/
    developer-guides/
    api/
  references/
    guides/
```

---

## Notes

- This skill creates or updates documentation files but does NOT commit them automatically
- Always review generated documentation before committing
- Screenshots and diagrams referenced in docs need to be added manually
- Code examples should be tested before finalizing
- Internal links should be verified after updates
- The skill follows existing documentation style and conventions
