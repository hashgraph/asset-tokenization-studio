// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ComplianceMockBase} from './ComplianceMockBase.sol';

contract ComplianceMockTrue is ComplianceMockBase {
    function canTransfer(
        address _from,
        address _to,
        uint256 _amount
    ) external view override returns (bool) {
        return true;
    }
}
