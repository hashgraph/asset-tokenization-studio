# IMintTypes

_Asset Tokenization Studio Team_

> IMintTypes

Issuance domain events shared across the mint facets.

_Holds the `Issued` event, emitted from both `Mint` (`issue`/`mint`) and `BatchMint` (`batchMint`), so consumers can monitor every issuance through a single topic. `IMint` inherits this interface; `BatchMint` imports it directly to reach the event without depending on the full `IMint` API._

## Events

### Issued

```solidity
event Issued(address indexed operator, address indexed to, uint256 value, bytes data)
```

Emitted when new tokens are issued to a holder.

#### Parameters

| Name               | Type    | Description                                          |
| ------------------ | ------- | ---------------------------------------------------- |
| operator `indexed` | address | Account that invoked the issuance (issuer or agent). |
| to `indexed`       | address | Recipient of the newly issued tokens.                |
| value              | uint256 | Amount of tokens issued, denominated in base units.  |
| data               | bytes   | Arbitrary payload forwarded alongside the issuance.  |
