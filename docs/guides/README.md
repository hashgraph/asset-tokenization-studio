# Developer Guides

This directory contains step-by-step guides and cookbooks for developers working on the Asset Tokenization Studio monorepo.

## Purpose

These guides provide practical, hands-on instructions for common development tasks that go beyond auto-generated API documentation. They answer the "How do I...?" questions that developers frequently ask.

## What Belongs Here

- **Setup Guides**: Environment configuration, tooling setup
- **Feature Development Guides**: Step-by-step instructions for adding new capabilities
- **Integration Guides**: How to integrate with external systems (wallets, custodians, etc.)
- **Debugging Guides**: Common issues and how to resolve them
- **Testing Guides**: How to write and run tests effectively
- **Deployment Guides**: How to deploy contracts and applications

## Guide Format

Each guide should:

1. **Start with a goal**: "In this guide, you will learn how to..."
2. **List prerequisites**: What knowledge or setup is required?
3. **Provide step-by-step instructions**: Clear, numbered steps
4. **Include code examples**: Real, working code snippets
5. **Explain the "why"**: Don't just show commands, explain the reasoning
6. **Link to related documentation**: Reference ADRs, EPs, or API docs
7. **Include troubleshooting**: Common issues and solutions

## Example Guides

Coming soon:

- `adding-a-smart-contract-facet.md`: How to add a new Diamond facet to ATS
- `integrating-a-custodial-wallet.md`: How to add support for a new wallet provider
- `creating-a-new-sdk-adapter.md`: How to implement a new transaction adapter
- `writing-integration-tests.md`: Best practices for integration testing
- `debugging-smart-contract-events.md`: How to trace and debug contract events

## Contributing Guides

When you find yourself explaining the same process multiple times, it's time to write a guide. Follow these steps:

1. Create a new `.md` file with a descriptive name (use kebab-case)
2. Use the guide format outlined above
3. Test your guide by having someone else follow it
4. Submit a PR with the `documentation` label
5. Update this README to link to your new guide

## Tips for Writing Good Guides

- **Write for beginners**: Assume minimal context, explain acronyms
- **Show, don't tell**: Include actual commands and code, not just descriptions
- **Use real examples**: Reference actual files in the codebase
- **Keep it updated**: Guides go stale quickly, review them periodically
- **Make it searchable**: Use clear headings and keywords

## Questions?

If you need help with a task not covered by existing guides, ask in the team chat or create an issue with the `documentation` label.
