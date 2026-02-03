// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICap } from "contracts/layer_1/interfaces/cap/ICap.sol";
import { _CAP_ROLE, _DEFAULT_ADMIN_ROLE } from "../constants/roles.sol";
import { Internals } from "../../layer_0/Internals.sol";

abstract contract Cap is ICap, Internals {
    /**
     * @notice Initialize or reinitialize Cap with version-based logic
     * @dev Replaces the old binary initialized flag with version tracking.
     *      - Fresh deploy (not initialized): Anyone can call (for Factory deployment)
     *      - Upgrade (already initialized): DEFAULT_ADMIN_ROLE required
     *      - Version check in storage wrapper handles idempotency and reverts if already at latest
     * @param params The initialization parameters
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_Cap(CapInitParams calldata params) external override onlyValidNewMaxSupply(params.maxSupply) {
        // For upgrades (already initialized), require admin role
        // Fresh deploy doesn't have roles assigned yet, so allow anyone
        if (_isCapInitialized()) {
            _checkRole(_DEFAULT_ADMIN_ROLE, _msgSender());
        }
        _initialize_Cap(params);
    }

    /**
     * @notice Rollback Cap facet to a previous version
     * @dev Requires DEFAULT_ADMIN_ROLE. Undoes storage changes made during version upgrades.
     * @param targetVersion The version to rollback to (must be < current version, >= 1)
     */
    // solhint-disable-next-line func-name-mixedcase
    function deinitialize_Cap(uint64 targetVersion) external override onlyRole(_DEFAULT_ADMIN_ROLE) {
        _deinitialize_Cap(targetVersion);
    }

    function setMaxSupply(
        uint256 _maxSupply
    ) external override onlyUnpaused onlyRole(_CAP_ROLE) onlyValidNewMaxSupply(_maxSupply) returns (bool success_) {
        _setMaxSupply(_maxSupply);
        success_ = true;
    }

    function setMaxSupplyByPartition(
        bytes32 _partition,
        uint256 _maxSupply
    )
        external
        override
        onlyUnpaused
        onlyRole(_CAP_ROLE)
        onlyValidNewMaxSupplyByPartition(_partition, _maxSupply)
        returns (bool success_)
    {
        _setMaxSupplyByPartition(_partition, _maxSupply);
        success_ = true;
    }

    function getMaxSupply() external view override returns (uint256 maxSupply_) {
        return _getMaxSupplyAdjustedAt(_blockTimestamp());
    }

    function getMaxSupplyByPartition(bytes32 _partition) external view override returns (uint256 maxSupply_) {
        return _getMaxSupplyByPartitionAdjustedAt(_partition, _blockTimestamp());
    }
}
