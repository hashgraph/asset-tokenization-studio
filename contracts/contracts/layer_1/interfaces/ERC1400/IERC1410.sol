// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IERC1410Basic} from './IERC1410Basic.sol';
import {IERC1410Controller} from './IERC1410Controller.sol';
import {IERC1410Operator} from './IERC1410Operator.sol';
import {IERC1410Standard} from './IERC1410Standard.sol';

// solhint-disable no-empty-blocks
interface IERC1410 is
    IERC1410Basic,
    IERC1410Controller,
    IERC1410Operator,
    IERC1410Standard
{

}
