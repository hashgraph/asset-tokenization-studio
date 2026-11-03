# IBurn

_Asset Tokenization Studio Team_

> IBurn

Interface exposing the ERC-1594 redemption and ERC-3643 burn surfaces of the ATS Diamond. Covers controller/agent-initiated burns, self-redemption, and operator-initiated redemption on behalf of a token holder.

## Methods

### burn

```solidity
function burn(address _userAddress, uint256 _amount) external nonpayable
```

Burns `_amount` tokens from `_userAddress` on behalf of a controller or agent.

_Caller must hold `ROLE_CONTROLLER` or `ROLE_AGENT`. Emits `IController.ControllerRedemption` rather than `Redeemed`._

#### Parameters

| Name          | Type    | Description                                          |
| ------------- | ------- | ---------------------------------------------------- |
| \_userAddress | address | Address whose token balance is reduced.              |
| \_amount      | uint256 | Amount of tokens to burn, denominated in base units. |

### initializeBurn

```solidity
function initializeBurn() external nonpayable
```

Initialises the burn capability on the token.

_Callable once; subsequent calls revert with `FacetAlreadyRegistered`. Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment._

### redeem

```solidity
function redeem(uint256 _value, bytes _data) external nonpayable
```

Redeems `_value` tokens from the caller&#39;s own balance under ERC-1594 semantics.

#### Parameters

| Name    | Type    | Description                                                                    |
| ------- | ------- | ------------------------------------------------------------------------------ |
| \_value | uint256 | Amount of tokens to redeem, denominated in base units.                         |
| \_data  | bytes   | Arbitrary payload that implementations may use to authenticate the redemption. |

### redeemFrom

```solidity
function redeemFrom(address _tokenHolder, uint256 _value, bytes _data) external nonpayable
```

Redeems `_value` tokens from `_tokenHolder`&#39;s balance, analogous to `transferFrom`.

_Both `msg.sender` and `_tokenHolder` must not be recovered addresses._

#### Parameters

| Name          | Type    | Description                                                                    |
| ------------- | ------- | ------------------------------------------------------------------------------ |
| \_tokenHolder | address | Account whose tokens are redeemed.                                             |
| \_value       | uint256 | Amount of tokens to redeem, denominated in base units.                         |
| \_data        | bytes   | Arbitrary payload that implementations may use to authenticate the redemption. |

## Events

### BurnInitialized

```solidity
event BurnInitialized()
```

Emitted once when the burn capability is initialised on a token.

_Fires exclusively from `initializeBurn`._

### Redeemed

```solidity
event Redeemed(address indexed operator, address indexed from, uint256 value, bytes data)
```

Emitted when tokens are redeemed from a holder&#39;s balance.

#### Parameters

| Name               | Type    | Description                                           |
| ------------------ | ------- | ----------------------------------------------------- |
| operator `indexed` | address | Account that executed the redemption.                 |
| from `indexed`     | address | Address from which tokens were burnt.                 |
| value              | uint256 | Amount of tokens redeemed, denominated in base units. |
| data               | bytes   | Arbitrary payload forwarded alongside the redemption. |
