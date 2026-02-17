// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { KpiLinkedRateModifiers } from "../interestRates/kpiLinkedRate/KpiLinkedRateModifiers.sol";

abstract contract ERC3643Modifiers is KpiLinkedRateModifiers {
    // ===== ERC3643 Modifiers =====
    modifier onlyEmptyWallet(address _tokenHolder) virtual;
    modifier onlyUnrecoveredAddress(address _account) virtual;
    modifier onlyValidInputAmountsArrayLength(address[] memory _addresses, uint256[] memory _amounts) virtual;
    modifier onlyValidInputBoolArrayLength(address[] memory _addresses, bool[] memory _status) virtual;
}
