---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix: `batchTransfer` now validates sender and each destination against the control list and compliance module independently.

Previously, `batchTransfer` used `onlyCompliant(sender, address(0), false)` for the sender and called `checkCompliance(address(0), to, false)` per destination, passing `address(0)` as the counterpart and `0` as the value in both cases. The sender was never validated as an individual account (only its compliance-contract approval was checked), and each per-destination compliance call omitted the actual sender and amount.

The sender is now checked via `onlyAccountCompliant(sender)`, which validates recovery status and control-list membership before any token movement. Inside the loop, each destination is checked with `checkAccountCompliance(to)` (recovery + control list) followed by `checkTransferCompliance(sender, to, amounts[i])`, which calls the compliance module with the real sender address and transfer amount.
