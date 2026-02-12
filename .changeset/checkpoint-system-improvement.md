---
"@hashgraph/asset-tokenization-contracts": patch
---

Enhance checkpoint system with step tracking, retry utilities, and CLI management

- Centralize deployment/checkpoint path management and step definitions
- Add retry utility with exponential backoff for transient network failures
- Implement checkpoint schema versioning with migration support
- Add checkpoint management CLI (list/show/delete/cleanup/reset)
- Add failure injection testing module for reproducible recovery testing
- Comprehensive test coverage and documentation for checkpoint system
