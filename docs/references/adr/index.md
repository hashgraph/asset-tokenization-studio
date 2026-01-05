---
id: index
title: Architecture Decision Records (ADRs)
sidebar_label: ADRs
---

# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the Asset Tokenization Studio monorepo.

## What is an ADR?

An Architecture Decision Record (ADR) captures an important architectural decision made along with its context and consequences. ADRs provide historical context and help new contributors understand why certain technical choices were made.

## When to Create an ADR

Create an ADR when you make a significant architectural decision, such as:

- Choosing a database technology (e.g., PostgreSQL vs. MongoDB)
- Selecting a framework or library for a core feature
- Defining system architecture patterns (e.g., Diamond Pattern for smart contracts)
- Making infrastructure decisions (e.g., deployment strategy)
- Establishing coding standards or best practices

## ADR vs. Enhancement Proposal (EP)

- **ADRs**: Record decisions that have **already been made** or are strictly architectural. They focus on context, decision, and consequences.
- **EPs**: Propose **new features or changes** before implementation. They focus on requirements, design, and allow for community discussion.

## How to Create an ADR

1. Copy `template.md.example` to a new file with the format: `NNNN-short-description.md`
   - Use a sequential number (e.g., `0001`, `0002`, etc.)
   - Use kebab-case for the description (e.g., `0001-adopt-diamond-pattern.md`)

2. Fill in the template sections:
   - **Metadata Table**: Update the visible table at the top with:
     - Status emoji: 📝 Proposed / ✅ Accepted / ❌ Rejected / 🔄 Superseded
     - Date in YYYY-MM-DD format
     - Your GitHub username linked (e.g., `[@username](https://github.com/username)`)
     - Scope: Global, ATS, Mass Payout, or SDK
   - **Context and Problem Statement**: Describe the issue or decision that needs to be made
   - **Decision Drivers**: List factors influencing the decision
   - **Considered Options**: Document alternatives that were evaluated
   - **Decision Outcome**: State the chosen option and rationale
   - **Consequences**: List positive and negative impacts

3. Update the YAML frontmatter (for Docusaurus metadata)

4. Create a Pull Request for team review

## ADR Lifecycle

- **Proposed**: Initial draft, open for discussion
- **Accepted**: Decision approved and implemented
- **Rejected**: Decision not approved
- **Superseded**: Replaced by a newer ADR (reference the new ADR number)

## Example ADRs

Coming soon as the team documents existing architectural decisions.
