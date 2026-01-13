---
id: index
title: Enhancement Proposals (EPs)
sidebar_label: Enhancement Proposals
---

# Enhancement Proposals (EPs)

This directory contains Enhancement Proposals (EPs) for the Asset Tokenization Studio monorepo.

## What is an Enhancement Proposal?

An Enhancement Proposal (EP) is a design document that proposes a new feature or significant change before implementation. EPs allow the community and team to discuss designs, identify issues, and reach consensus before code is written.

## When to Create an EP

Create an EP when you want to propose:

- A new feature or capability
- A significant change to existing functionality
- A breaking change that affects users
- A new API or contract interface
- An architectural change that spans multiple modules
- Any change that requires design review and community input

## EP vs. Architecture Decision Record (ADR)

- **EPs**: Propose **new features or changes** before implementation. They focus on requirements, design, and allow for community discussion via Pull Requests.
- **ADRs**: Record decisions that have **already been made** or are strictly architectural. They focus on context, decision, and consequences.

## How to Create an EP

1. **Copy the template**: Copy `template.md.example` to a new file with the format: `NNNN-feature-name.md`
   - Use a sequential number (e.g., `0001`, `0002`, etc.)
   - Use kebab-case for the feature name (e.g., `0001-staking-rewards.md`)
   - Optionally prefix with project scope (e.g., `0001-ats-staking-rewards.md`)

2. **Fill in the template**: Complete all relevant sections:
   - **Metadata Table**: Update the visible table at the top with:
     - Status emoji: 📝 Draft / 🔍 Provisional / ✅ Implementable / 🚀 Implemented / ❌ Rejected
     - Created date in YYYY-MM-DD format
     - Your GitHub username linked (e.g., `[@username](https://github.com/username)`)
     - Scope: Global, ATS, Mass Payout, or SDK
     - Links to related Epic/Issue and ADRs
   - **Summary**: Brief overview of the proposal
   - **Motivation**: User story and problem statement
   - **Proposal**: Detailed design and architecture
   - **Implementation Details**: Technical specifications
   - **UI/UX**: User flows and mockups
   - **Testing Strategy**: How will this be tested?
   - **Drawbacks & Alternatives**: What are the trade-offs?

3. **Create a Pull Request**: Submit the EP as a PR in **Draft** status
   - Add appropriate labels (e.g., `ep`, `ats`, `mass-payout`)
   - Request reviews from relevant team members
   - Link to any related issues or epics

4. **Iterate based on feedback**: Address comments and update the EP

5. **Get approval**: Once consensus is reached, merge the PR and update status to `Implementable`

6. **Implement**: Begin coding the feature, referencing the EP

7. **Update status**: Once implemented, update the EP status to `Implemented`

## EP Lifecycle

EPs go through the following statuses:

1. **Draft**: Initial proposal, open for discussion and major changes
2. **Provisional**: Design is mostly agreed upon, minor refinements possible
3. **Implementable**: Approved and ready for implementation
4. **Implemented**: Feature has been built and released
5. **Rejected**: Proposal was not accepted (include rejection reason)
6. **Superseded**: Replaced by another EP (reference the new EP)

## EP Status Updates

Update the EP status as it progresses:

```yaml
status: Draft          # Initial submission
status: Provisional    # Design approved pending final review
status: Implementable  # Ready to implement
status: Implemented    # Feature is live
```

## Best Practices

### Before Writing an EP

- Search existing EPs to avoid duplicates
- Discuss the idea informally with the team first
- Check if an ADR already covers this decision

### While Writing an EP

- **Be specific**: Provide concrete examples and use cases
- **Consider alternatives**: Show you've evaluated multiple approaches
- **Think about migration**: How will existing users be affected?
- **Include security**: Address potential security implications
- **Plan for testing**: How will you verify this works?

### During Review

- **Respond to feedback**: Engage with reviewers constructively
- **Update the EP**: Incorporate feedback directly into the document
- **Reach consensus**: Work toward agreement, not perfection
- **Document open questions**: It's okay to have unknowns

### After Approval

- **Reference the EP**: Link to it in PRs, issues, and commits
- **Keep it updated**: If the implementation diverges, update the EP
- **Mark as implemented**: Update the status when the feature ships

## Example EPs

Coming soon as the team documents proposed features.

## Questions?

If you're unsure whether to create an EP or ADR, ask yourself:

- **Is this a decision already made?** → ADR
- **Is this a proposal for something new?** → EP
- **Is this a small bug fix or minor change?** → Neither, just create a PR

When in doubt, create an EP. It's better to over-document than under-document.
