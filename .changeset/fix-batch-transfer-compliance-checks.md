---
"@hashgraph/asset-tokenization-contracts": patch
---

Fix `batchTransfer` to validate the sender and each destination against the control list and compliance module independently. Previously it checked the sender only via `onlyCompliant(sender, address(0), false)` and each destination via `checkCompliance(address(0), to, false)`, passing `address(0)` as the counterpart and `0` as the value — so the sender was never validated as an account and per-destination compliance calls omitted the real sender and amount. The sender is now checked with `onlyAccountCompliant(sender)` (recovery + control list), and each destination with `checkAccountCompliance(to)` followed by `checkTransferCompliance(sender, to, amounts[i])` using the real sender and amount.
