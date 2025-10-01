// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    BondStorageWrapperFixedInterestRate
} from './bond/BondStorageWrapper.sol';

// solhint-disable no-empty-blocks
abstract contract CommonFixedInterestRate is
    BondStorageWrapperFixedInterestRate
{
}
