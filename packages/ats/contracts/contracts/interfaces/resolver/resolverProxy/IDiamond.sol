// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import {IDiamondCut} from './IDiamondCut.sol';
import {IDiamondLoupe} from './IDiamondLoupe.sol';

// solhint-disable-next-line no-empty-blocks
interface IDiamond is IDiamondCut, IDiamondLoupe {}
