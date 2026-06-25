---
"@hashgraph/asset-tokenization-contracts": minor
---

Clean the deploy scripts and Factory so only Equity, Bond and DepositToken are deployed, removing the Loan, LoansPortfolio, BondFixedRate and BondKpiLinkedRate deploy configurations and the Factory `SecurityType` entries for them.
