---
"@hashgraph/mass-payout-contracts": patch
"@hashgraph/mass-payout-sdk": patch
"@hashgraph/mass-payout-backend": patch
"@hashgraph/mass-payout-frontend": patch
---

Fix npm vulnerabilities and downstream compatibility issues:

- Update npm dependencies to address security vulnerabilities across mass-payout packages
- Fix mass-payout contract imports to use updated `facets/` folder structure from `@hashgraph/asset-tokenization-contracts`
- Fix ethers v6 API compatibility in backend: update imports from `ethers/lib/utils` to `ethers`, replace deprecated `eventFragment.inputs` with `fragment.inputs`, and replace `constants.AddressZero` with `ZeroAddress`
- Fix `FileCreateTransaction` in SDK to use account's public key instead of empty keys
