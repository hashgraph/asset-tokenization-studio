---
"@hashgraph/asset-tokenization-sdk": patch
"@hashgraph/asset-tokenization-dapp": patch
---

Fix failing tests in web app and SDK:

- Mock ESM-only packages (@hashgraph/hedera-wallet-connect, @reown/appkit) in web jest config to resolve CJS/ESM incompatibility
- Fix HederaWalletConnectTransactionAdapter unit test: use jest.spyOn for read-only rpcProvider property
- Update environmentMock paths for custodial adapters (hs/hts/custodial → hs/custodial) following file restructure
- Remove mocks for deleted HederaTransactionAdapter and abstract CustodialTransactionAdapter
- Add register() and createBond() mocks to DFNS, Fireblocks, and AWSKMS custodial adapter mocks
- Grant \_KPI_MANAGER_ROLE to bond creator in createBond mock to enable addKpiData tests
