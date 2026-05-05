// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IEquity } from "./IEquity.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { EquityStorageWrapper } from "../../../domain/asset/EquityStorageWrapper.sol";

abstract contract Equity is IEquity, Modifiers {
    function getEquityDetails() external view override returns (EquityDetailsData memory equityDetailsData_) {
        return EquityStorageWrapper.getEquityDetails();
    }

    // solhint-disable-next-line func-name-mixedcase
    function _initializeEquity(EquityDetailsData calldata _equityDetailsData) internal {
        EquityStorageWrapper.initializeEquityDetails(_equityDetailsData);
    }
}
