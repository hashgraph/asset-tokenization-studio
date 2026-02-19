// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IAdjustBalancesStorageWrapper {
    event AdjustmentBalanceSet(address indexed operator, uint256 factor, uint8 decimals);

    error FactorIsZero();
}
