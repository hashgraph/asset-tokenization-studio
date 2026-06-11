# IControllerTypes

_Asset Tokenization Studio Team_

> IControllerTypes

Controller (ERC-1644) domain events shared across facets that perform forced transfers and redemptions.

_Holds the `ControllerTransfer` and `ControllerRedemption` events. `ControllerTransfer` is emitted from `Controller` and `BatchController`; `ControllerRedemption` is emitted from `Controller`, `Burn` and `BatchBurn`. `IController` inherits this interface; the other facets import it directly to reach the events without depending on the full `IController` API._

## Events

### ControllerRedemption

```solidity
event ControllerRedemption(address controller, address indexed tokenHolder, uint256 value, bytes data, bytes operatorData)
```

Emitted when an authorised controller redeems (burns) tokens on behalf of a holder.

#### Parameters

| Name                  | Type    | Description                                                     |
| --------------------- | ------- | --------------------------------------------------------------- |
| controller            | address | The address of the controller that initiated the redemption.    |
| tokenHolder `indexed` | address | The account whose tokens are redeemed.                          |
| value                 | uint256 | The amount of tokens redeemed.                                  |
| data                  | bytes   | Optional data attached to the redemption for validation.        |
| operatorData          | bytes   | Optional data attached by the controller for event attribution. |

### ControllerTransfer

```solidity
event ControllerTransfer(address controller, address indexed from, address indexed to, uint256 value, bytes data, bytes operatorData)
```

Emitted when an authorised controller transfers tokens between two holders.

#### Parameters

| Name           | Type    | Description                                                     |
| -------------- | ------- | --------------------------------------------------------------- |
| controller     | address | The address of the controller that initiated the transfer.      |
| from `indexed` | address | The address tokens are transferred from.                        |
| to `indexed`   | address | The address tokens are transferred to.                          |
| value          | uint256 | The amount of tokens transferred.                               |
| data           | bytes   | Optional data attached to the transfer for validation.          |
| operatorData   | bytes   | Optional data attached by the controller for event attribution. |
