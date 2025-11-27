// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICap } from "../interfaces/cap/ICap.sol";
import { _CAP_ROLE } from "../constants/roles.sol";
import { Common } from "../common/Common.sol";

abstract contract Cap is ICap, Common {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_Cap(
        uint256 maxSupply,
        PartitionCap[] calldata partitionCap
    ) external override onlyUninitialized(_capStorage().initialized) onlyValidNewMaxSupply(maxSupply) {
        CapDataStorage storage capStorage = _capStorage();

        capStorage.maxSupply = maxSupply;

        for (uint256 i = 0; i < partitionCap.length; i++) {
            capStorage.maxSupplyByPartition[partitionCap[i].partition] = partitionCap[i].maxSupply;
        }

        capStorage.initialized = true;
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
        return _getMaxSupplyAdjusted();
    }

    function getMaxSupplyByPartition(bytes32 _partition) external view override returns (uint256 maxSupply_) {
        return _getMaxSupplyByPartitionAdjusted(_partition);
    }
}
