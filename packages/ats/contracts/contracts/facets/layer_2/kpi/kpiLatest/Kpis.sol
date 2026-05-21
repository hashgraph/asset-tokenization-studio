// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKpis } from "./IKpis.sol";
import { ROLE_KPI_MANAGER } from "../../../../constants/roles.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { KpisStorageWrapper } from "../../../../domain/asset/KpisStorageWrapper.sol";
import { DEFAULT_ADMIN_ROLE } from "../../../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../../../domain/core/InitializerStorageWrapper.sol";
import { _KPIS_LATEST_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";

abstract contract Kpis is IKpis, Modifiers {
    /// @inheritdoc IKpis
    function initializeKpis()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(_KPIS_LATEST_KPI_LINKED_RATE_RESOLVER_KEY)
    {
        InitializerStorageWrapper.setFacetToReady(_KPIS_LATEST_KPI_LINKED_RATE_RESOLVER_KEY);
        emit KpisInitialized();
    }

    function addKpiData(
        uint256 _date,
        uint256 _value,
        address _project
    ) external onlyActivated onlyUnpaused onlyRole(ROLE_KPI_MANAGER) onlyValidDate(_date, _project) {
        KpisStorageWrapper.addKpiData(_date, _value, _project);
    }

    function getLatestKpiData(
        uint256 _from,
        uint256 _to,
        address _project
    ) external view returns (uint256 value_, bool exists_) {
        return KpisStorageWrapper.getLatestKpiData(_from, _to, _project);
    }

    function getMinDate() external view returns (uint256 minDate_) {
        return KpisStorageWrapper.getMinDateAdjusted();
    }

    function isCheckPointDate(uint256 _date, address _project) external view returns (bool exists_) {
        return KpisStorageWrapper.isCheckpointDate(_date, _project);
    }
}
