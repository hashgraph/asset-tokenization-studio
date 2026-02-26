// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldRead } from "./IHoldRead.sol";
import { IHoldTokenHolder } from "./IHoldTokenHolder.sol";
import { IHoldManagement } from "./IHoldManagement.sol";
import { IAccessControl } from "../IAccessControl.sol";
import { IERC1410 } from "../ERC1400/IERC1410.sol";

// solhint-disable-next-line no-empty-blocks
interface IHold is IHoldRead, IHoldManagement, IHoldTokenHolder, IAccessControl, IERC1410 {}
