// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CapModifiers } from "../cap/CapModifiers.sol";
import { IClearing } from "../../layer_1/interfaces/clearing/IClearing.sol";

abstract contract ClearingModifiers is CapModifiers {
    modifier onlyWithValidExpirationTimestamp(uint256 _expirationTimestamp) virtual;
    modifier onlyClearingActivated() virtual;
    modifier onlyWithValidClearingId(IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier)
        virtual;
    modifier validateExpirationTimestamp(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        bool _mustBeExpired
    ) virtual;
}
