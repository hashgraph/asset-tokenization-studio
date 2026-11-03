# ICompliance

_Asset Tokenization Studio Team_

> ICompliance

Minimal adapter interface for querying and notifying an external compliance contract.

_Implemented by third-party compliance modules whose address is registered on the token. The token calls these functions on every transfer, issuance, and redemption so the compliance module can enforce rules and maintain its own internal state._

## Methods

### canTransfer

```solidity
function canTransfer(address _from, address _to, uint256 _amount) external view returns (bool)
```

Checks whether a transfer between two addresses is permitted.

#### Parameters

| Name     | Type    | Description                   |
| -------- | ------- | ----------------------------- |
| \_from   | address | Address sending the tokens.   |
| \_to     | address | Address receiving the tokens. |
| \_amount | uint256 | Token quantity to transfer.   |

#### Returns

| Name | Type | Description                                       |
| ---- | ---- | ------------------------------------------------- |
| \_0  | bool | True if the transfer is allowed; false otherwise. |

### created

```solidity
function created(address _to, uint256 _amount) external nonpayable
```

Notifies the compliance module that tokens have been issued.

_The compliance module should update any issuance-tracking state accordingly._

#### Parameters

| Name     | Type    | Description                                    |
| -------- | ------- | ---------------------------------------------- |
| \_to     | address | Address that received the newly issued tokens. |
| \_amount | uint256 | Token quantity issued.                         |

### destroyed

```solidity
function destroyed(address _from, uint256 _amount) external nonpayable
```

Notifies the compliance module that tokens have been redeemed.

_The compliance module should update any redemption-tracking state accordingly._

#### Parameters

| Name     | Type    | Description                         |
| -------- | ------- | ----------------------------------- |
| \_from   | address | Address whose tokens were redeemed. |
| \_amount | uint256 | Token quantity redeemed.            |

### transferred

```solidity
function transferred(address _from, address _to, uint256 _amount) external nonpayable
```

Notifies the compliance module that a transfer has been executed.

_The compliance module should update any transfer-tracking state accordingly._

#### Parameters

| Name     | Type    | Description                       |
| -------- | ------- | --------------------------------- |
| \_from   | address | Address that sent the tokens.     |
| \_to     | address | Address that received the tokens. |
| \_amount | uint256 | Token quantity transferred.       |
