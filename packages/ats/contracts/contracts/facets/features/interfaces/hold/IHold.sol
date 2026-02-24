// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import "./IHoldTypes.sol";
import { IHoldRead } from "./IHoldRead.sol";
import { IHoldTokenHolder } from "./IHoldTokenHolder.sol";
import { IHoldManagement } from "./IHoldManagement.sol";
import { IAccessControl } from "../IAccessControl.sol";
import { IClearing } from "../clearing/IClearing.sol";
import { IERC1410 } from "../ERC1400/IERC1410.sol";

interface IHold is IHoldRead, IHoldManagement, IHoldTokenHolder, IAccessControl, IClearing, IERC1410 {
    error HoldExpirationNotReached();
    error WrongHoldId();
    error InvalidDestinationAddress(address holdDestination, address to);
    error InsufficientHoldBalance(uint256 holdAmount, uint256 amount);
    error HoldExpirationReached();
    error IsNotEscrow();
}
