// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IComplianceByPartition, RESOLVER_KEY_COMPLIANCE_BY_PARTITION } from "./IComplianceByPartition.sol";
import { ERC1594StorageWrapper } from "../../domain/asset/ERC1594StorageWrapper.sol";
import { PauseStorageWrapper } from "../../domain/core/PauseStorageWrapper.sol";
import { IPause } from "../pause/IPause.sol";
import { Eip1066 } from "../../constants/eip1066.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title ComplianceByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IComplianceByPartition`, providing partition-aware
 *         transfer and redemption eligibility checks.
 * @dev Delegates the actual validation to `ERC1594StorageWrapper.canTransferFromByPartition`
 *      and `ERC1594StorageWrapper.canRedeemFromByPartition`. When the token is paused both
 *      checks short-circuit with the EIP-1066 PAUSED status code. Intended to be inherited by
 *      `ComplianceByPartitionFacet`.
 */
abstract contract ComplianceByPartition is IComplianceByPartition, Modifiers {
    /// @inheritdoc IComplianceByPartition
    function initializeComplianceByPartition()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_COMPLIANCE_BY_PARTITION)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_COMPLIANCE_BY_PARTITION);
        emit ComplianceByPartitionInitialized();
    }

    /// @inheritdoc IComplianceByPartition
    function canTransferByPartition(
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external view override returns (bool, bytes1, bytes32) {
        if (PauseStorageWrapper.isPaused()) {
            return (false, Eip1066.PAUSED, IPause.IsPaused.selector);
        }
        (bool status, bytes1 statusCode, bytes32 reason, ) = ERC1594StorageWrapper.canTransferFromByPartition(
            _from,
            _to,
            _partition,
            _value,
            _data,
            _operatorData
        );
        return (status, statusCode, reason);
    }

    /// @inheritdoc IComplianceByPartition
    function canRedeemByPartition(
        address _from,
        bytes32 _partition,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external view override returns (bool, bytes1, bytes32) {
        if (PauseStorageWrapper.isPaused()) {
            return (false, Eip1066.PAUSED, IPause.IsPaused.selector);
        }
        (bool status, bytes1 code, bytes32 reason, ) = ERC1594StorageWrapper.canRedeemFromByPartition(
            _from,
            _partition,
            _value,
            _data,
            _operatorData
        );
        return (status, code, reason);
    }
}
