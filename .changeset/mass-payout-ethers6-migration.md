---
"@hashgraph/mass-payout-contracts": minor
"@hashgraph/mass-payout-sdk": minor
---

Migrate mass-payout packages from ethers v5 to ethers v6:

- Update contracts tests and scripts to ethers v6 API (getAddress, waitForDeployment, parseUnits)
- Migrate SDK to ethers v6 with updated provider/signer patterns and BigInt usage
- Update hardhat-chai-matchers to v2 with stricter array assertion matching
