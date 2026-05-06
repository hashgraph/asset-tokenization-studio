// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Management } from "./IERC1410Management.sol";
import { IProtectedPartitions } from "../../../../facets/layer_1/protectedPartition/IProtectedPartitions.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";
import { TokenCoreOps } from "../../../../domain/orchestrator/TokenCoreOps.sol";

abstract contract ERC1410Management is IERC1410Management, Modifiers {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1410(bool _multiPartition) external override onlyNotERC1410Initialized {
        ERC1410StorageWrapper.initialize_ERC1410(_multiPartition);
    }

    function protectedTransferFromByPartition(
        bytes32 _partition,
        address _from,
        address _to,
        uint256 _amount,
        IProtectedPartitions.ProtectionData calldata _protectionData
    )
        external
        override
        onlyUnpaused
        onlyRole(ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition))
        onlyProtectedPartitions
        onlyCanTransferFromByPartition(_from, _to, _partition, _amount)
        returns (bytes32)
    {
        return TokenCoreOps.protectedTransferFromByPartition(_partition, _from, _to, _amount, _protectionData);
    }

    function protectedRedeemFromByPartition(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        IProtectedPartitions.ProtectionData calldata _protectionData
    )
        external
        override
        onlyUnpaused
        onlyRole(ProtectedPartitionsStorageWrapper.protectedPartitionsRole(_partition))
        onlyProtectedPartitions
        onlyCanRedeemFromByPartition(_from, _partition, _amount)
    {
        TokenCoreOps.protectedRedeemFromByPartition(_partition, _from, _amount, _protectionData);
    }
}
