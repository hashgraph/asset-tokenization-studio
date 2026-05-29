// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKpis, RESOLVER_KEY_KPIS_LATEST_KPI_LINKED_RATE } from "./IKpis.sol";
import { ROLE_KPI_MANAGER } from "../../../../constants/roles.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { KpisStorageWrapper } from "../../../../domain/asset/KpisStorageWrapper.sol";
import { DEFAULT_ADMIN_ROLE } from "../../../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title KPI Management Facet
 * @notice Manages KPI data points used by KPI-linked rate logic for asset instruments.
 * @dev This facet stores and queries KPI checkpoints through `KpisStorageWrapper`. It must
 *      be initialised once by an account with the default admin role before dependent
 *      resolver-based functionality is considered ready. Mutating operations require the
 *      token to be operational, activated, unpaused, and the caller to hold the KPI manager
 *      role.
 * @author Asset Tokenization Studio Team
 */
abstract contract Kpis is IKpis, Modifiers {
    /// @inheritdoc IKpis
    /// @dev Marks the KPI latest KPI-linked rate resolver as ready and emits `KpisInitialized`.
    function initializeKpis()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_KPIS_LATEST_KPI_LINKED_RATE)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_KPIS_LATEST_KPI_LINKED_RATE);
        emit KpisInitialized();
    }

    /// @inheritdoc IKpis
    /// @dev Persists a KPI checkpoint for `_project`; reverts unless `_date` is valid.
    function addKpiData(
        uint256 _date,
        uint256 _value,
        address _project
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_KPI_MANAGER)
        onlyValidDate(_date, _project)
    {
        KpisStorageWrapper.addKpiData(_date, _value, _project);
    }

    /// @inheritdoc IKpis
    function getLatestKpiData(
        uint256 _from,
        uint256 _to,
        address _project
    ) external view returns (uint256 value_, bool exists_) {
        return KpisStorageWrapper.getLatestKpiData(_from, _to, _project);
    }

    /// @inheritdoc IKpis
    function getMinDate() external view returns (uint256 minDate_) {
        return KpisStorageWrapper.getMinDateAdjusted();
    }

    /// @inheritdoc IKpis
    function isCheckPointDate(uint256 _date, address _project) external view returns (bool exists_) {
        return KpisStorageWrapper.isCheckpointDate(_date, _project);
    }
}
