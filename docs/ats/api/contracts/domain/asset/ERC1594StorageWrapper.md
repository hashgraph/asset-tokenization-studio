# ERC1594StorageWrapper

_Asset Tokenization Studio Team_

> ERC1594StorageWrapper

Library providing the core issuance, redemption, and compliance checking logic for the ERC1594 token standard. Handles storage management, balance mutations via ERC20/ERC1410 wrappers, and multi-layered access controls (KYC, identity, compliance, control lists, allowances, partitions).

_All public functions revert with standard error selectors when preconditions fail. Relies on EIP1066 status codes for categorisation. Uses a diamond storage pattern anchored at `STORAGE_LOCATION_ERC1594`. Internal and private helpers are designed for gas-efficient reusability across transfer and redemption flows._
