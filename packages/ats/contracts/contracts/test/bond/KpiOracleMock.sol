// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IKpiOracle} from '../../layer_2/interfaces/bond/IKpiOracle.sol';
import {
    IBondStorageWrapper
} from '../../layer_2/interfaces/bond/IBondStorageWrapper.sol';

contract KpiOracleMock is IKpiOracle {
    error KpiOracleMock_Error();

    bool private revertFlag;

    function setRevertFlag(bool _revertFlag) external {
        revertFlag = _revertFlag;
    }

    function getImpactData() external view returns (uint256 impactData_) {
        if (revertFlag) {
            revert KpiOracleMock_Error();
        }
        return 1;
    }
}
