# ICompliance

## Methods

### canTransfer

```solidity
function canTransfer(address _from, address _to, uint256 _amount) external view returns (bool)
```

Query the compliance module to check if a transfer can be made

#### Parameters

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| \_from   | address | undefined   |
| \_to     | address | undefined   |
| \_amount | uint256 | undefined   |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| \_0  | bool | undefined   |

### created

```solidity
function created(address _to, uint256 _amount) external nonpayable
```

Notify the compliance module that an issue has been made

_The compliance module will update its internal state accordingly_

#### Parameters

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| \_to     | address | undefined   |
| \_amount | uint256 | undefined   |

### destroyed

```solidity
function destroyed(address _from, uint256 _amount) external nonpayable
```

Notify the compliance module that a redemption has been made

_The compliance module will update its internal state accordingly_

#### Parameters

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| \_from   | address | undefined   |
| \_amount | uint256 | undefined   |

### transferred

```solidity
function transferred(address _from, address _to, uint256 _amount) external nonpayable
```

Notify the compliance module that a transfer has been made

_The compliance module will update its internal state accordingly_

#### Parameters

| Name     | Type    | Description |
| -------- | ------- | ----------- |
| \_from   | address | undefined   |
| \_to     | address | undefined   |
| \_amount | uint256 | undefined   |
