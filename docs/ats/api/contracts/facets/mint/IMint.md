# IMint

_Asset Tokenization Studio Team_

> IMint

Interface aggregating the token issuance entry points of the ATS Diamond.

_Consolidates the ERC-1594 `issue`/`isIssuable` pair and the ERC-3643 `mint` operation in a single facet. Both write operations require the caller to hold either the issuer or agent role, honour max-supply and compliance checks, and emit the `Issued` event from `IERC1594`._

## Methods

### initializeERC1594

```solidity
function initializeERC1594() external nonpayable
```

Initialises the ERC-1594 StorageWrapper on the calling contract.

_Can only be invoked once per contract; subsequent calls revert via `onlyFacetNotRegistered`._

### isIssuable

```solidity
function isIssuable() external view returns (bool issuable_)
```

Returns whether further issuance is permitted for this security.

_Once a token returns `false` it must never return `true` again. Implementations read the issuance flag maintained by `ERC1594StorageWrapper`._

#### Returns

| Name       | Type | Description                                          |
| ---------- | ---- | ---------------------------------------------------- |
| issuable\_ | bool | True while new tokens may still be issued or minted. |

### issue

```solidity
function issue(address _tokenHolder, uint256 _value, bytes _data) external nonpayable
```

Issues new tokens to a token holder under the ERC-1594 semantics.

_Restricted to issuer or agent roles. Increases the total supply and emits `IERC1594.Issued`. Only callable in single-partition mode and when the token is unpaused; the destination must pass identity and compliance checks._

#### Parameters

| Name          | Type    | Description                                                              |
| ------------- | ------- | ------------------------------------------------------------------------ |
| \_tokenHolder | address | Recipient of the newly issued tokens.                                    |
| \_value       | uint256 | Amount of tokens to issue, denominated in base units.                    |
| \_data        | bytes   | Arbitrary data forwarded alongside the issuance for off-chain consumers. |

### mint

```solidity
function mint(address _to, uint256 _amount) external nonpayable
```

Mints new tokens to a recipient under the ERC-3643 semantics.

_Behaves as a thin alias over `issue` with an empty `data` payload. Restricted to issuer or agent roles and subject to the same pause, supply, identity and compliance constraints. Emits `IERC1594.Issued`._

#### Parameters

| Name     | Type    | Description                                          |
| -------- | ------- | ---------------------------------------------------- |
| \_to     | address | Recipient of the newly minted tokens.                |
| \_amount | uint256 | Amount of tokens to mint, denominated in base units. |

## Events

### ERC1594Initialized

```solidity
event ERC1594Initialized()
```

/\*\*Emitted once when the ERC-1594 capability is initialised on a token.

_Fires exclusively from `initializeERC1594` after the storage write succeeds._

### Issued

```solidity
event Issued(address indexed _operator, address indexed _to, uint256 _value, bytes _data)
```

Emitted when new tokens are issued to a holder.

#### Parameters

| Name                 | Type    | Description                                          |
| -------------------- | ------- | ---------------------------------------------------- |
| \_operator `indexed` | address | Account that invoked the issuance (issuer or agent). |
| \_to `indexed`       | address | Recipient of the newly issued tokens.                |
| \_value              | uint256 | Amount of tokens issued, denominated in base units.  |
| \_data               | bytes   | Arbitrary payload forwarded alongside the issuance.  |
