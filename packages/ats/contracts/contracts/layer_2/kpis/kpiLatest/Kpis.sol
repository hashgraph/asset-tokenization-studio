// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKpis } from "../../interfaces/kpis/kpiLatest/IKpis.sol";
import { _KPI_MANAGER_ROLE } from "../../constants/roles.sol";
import {
    InternalsSustainabilityPerformanceTargetInterestRate
} from "contracts/layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/sustainabilityPerformanceTargetInterestRate/Internals.sol";

abstract contract Kpis is IKpis, InternalsSustainabilityPerformanceTargetInterestRate {
    function addKpiData(
        uint256 _date,
        uint256 _value,
        address _project
    ) external onlyRole(_KPI_MANAGER_ROLE) onlyUnpaused isValidDate(_date, _project) {
        _addKpiData(_date, _value, _project);
    }

    function getLatestKpiData(
        uint256 _from,
        uint256 _to,
        address _project
    ) external view returns (uint256 value_, bool exists_) {
        return _getLatestKpiData(_from, _to, _project);
    }

    function getMinDate() external view returns (uint256 minDate_) {
        return _getMinDateAdjusted();
    }

    function isCheckPointDate(uint256 _date, address _project) external view returns (bool exists_) {
        return _isCheckpointDate(_date, _project);
    }
}
