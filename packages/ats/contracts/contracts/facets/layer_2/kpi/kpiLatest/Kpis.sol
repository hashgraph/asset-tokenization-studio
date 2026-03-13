// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKpis } from "./IKpis.sol";
import { _KPI_MANAGER_ROLE } from "../../../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { KpisStorageWrapper } from "../../../../domain/asset/KpisStorageWrapper.sol";

abstract contract Kpis is IKpis {
    function addKpiData(uint256 _date, uint256 _value, address _project) external {
        AccessControlStorageWrapper._checkRole(_KPI_MANAGER_ROLE, msg.sender);
        PauseStorageWrapper._requireNotPaused();
        KpisStorageWrapper._requireValidDate(_date, _project);
        KpisStorageWrapper._addKpiData(_date, _value, _project);
    }

    function getLatestKpiData(
        uint256 _from,
        uint256 _to,
        address _project
    ) external view returns (uint256 value_, bool exists_) {
        return KpisStorageWrapper._getLatestKpiData(_from, _to, _project);
    }

    function getMinDate() external view returns (uint256 minDate_) {
        return KpisStorageWrapper._getMinDateAdjusted();
    }

    function isCheckPointDate(uint256 _date, address _project) external view returns (bool exists_) {
        return KpisStorageWrapper._isCheckpointDate(_date, _project);
    }
}
