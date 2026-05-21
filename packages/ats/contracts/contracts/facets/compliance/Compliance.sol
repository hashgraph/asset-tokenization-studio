// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ROLE_TREX_OWNER, DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { IComplianceFacet, RESOLVER_KEY_COMPLIANCE } from "./IComplianceFacet.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { PauseStorageWrapper } from "../../domain/core/PauseStorageWrapper.sol";
import { IPause } from "../pause/IPause.sol";
import { ERC1594StorageWrapper } from "../../domain/asset/ERC1594StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../domain/core/ERC3643StorageWrapper.sol";
import { Eip1066 } from "../../constants/eip1066.sol";
import { ICompliance } from "../layer_1/ERC3643/ICompliance.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title Compliance
 * @notice Abstract implementation of transfer-eligibility checks and compliance contract management.
 * @dev Consolidates `canTransfer`, `canTransferFrom`, `setCompliance`, and `compliance` in a single
 *      abstract contract. Both transfer-check functions are restricted to single-partition mode and
 *      delegate the actual validation to `ERC1594StorageWrapper.isAbleToTransferFromByPartition`.
 *      When the token is paused they short-circuit with the EIP-1066 PAUSED status code.
 */
abstract contract Compliance is IComplianceFacet, Modifiers {
    /// @inheritdoc IComplianceFacet
    function initializeCompliance()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_COMPLIANCE)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_COMPLIANCE);
        emit ComplianceInitialized();
    }

    /// @inheritdoc IComplianceFacet
    function setCompliance(address _compliance) external override onlyActivated onlyUnpaused onlyRole(ROLE_TREX_OWNER) {
        ERC3643StorageWrapper.setCompliance(_compliance);
    }

    /// @inheritdoc IComplianceFacet
    function canTransfer(
        address _to,
        uint256 _value,
        bytes memory _data
    ) external view override onlyWithoutMultiPartition returns (bool, bytes1, bytes32) {
        if (PauseStorageWrapper.isPaused()) {
            return (false, Eip1066.PAUSED, IPause.IsPaused.selector);
        }
        (bool status, bytes1 statusCode, bytes32 reason, ) = ERC1594StorageWrapper.isAbleToTransferFromByPartition(
            EvmAccessors.getMsgSender(),
            _to,
            _DEFAULT_PARTITION,
            _value,
            _data,
            ""
        );
        return (status, statusCode, reason);
    }

    /// @inheritdoc IComplianceFacet
    function canTransferFrom(
        address _from,
        address _to,
        uint256 _value,
        bytes memory _data
    ) external view override onlyWithoutMultiPartition returns (bool, bytes1, bytes32) {
        if (PauseStorageWrapper.isPaused()) {
            return (false, Eip1066.PAUSED, IPause.IsPaused.selector);
        }
        (bool status, bytes1 statusCode, bytes32 reason, ) = ERC1594StorageWrapper.isAbleToTransferFromByPartition(
            _from,
            _to,
            _DEFAULT_PARTITION,
            _value,
            _data,
            ""
        );
        return (status, statusCode, reason);
    }

    /// @inheritdoc IComplianceFacet
    function compliance() external view override returns (ICompliance) {
        return ERC3643StorageWrapper.getCompliance();
    }
}
