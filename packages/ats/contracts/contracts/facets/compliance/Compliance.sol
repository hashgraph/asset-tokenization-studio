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
import { ICompliance } from "./externalInterfaces/ICompliance.sol";
import { IERC3643Types } from "../commonTypes/IERC3643Types.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title Compliance
 * @notice Manages ERC-3643 compliance configuration and single-partition transfer checks.
 * @dev Provides the compliance facet initialisation hook, compliance contract storage access,
 *      and ERC-1594 transfer validation helpers for default-partition assets. Transfer checks
 *      short-circuit with the EIP-1066 paused status when the token is paused and otherwise
 *      delegate eligibility validation to the ERC-1594 storage wrapper.
 * @author Asset Tokenization Studio Team
 */
abstract contract Compliance is IComplianceFacet, Modifiers {
    /// @inheritdoc IComplianceFacet
    /// @dev Wires the compliance contract address, marks the compliance facet as ready, and emits
    ///      `ComplianceInitialized`. One-shot is enforced by `onlyFacetNotRegistered`.
    function initializeCompliance(
        address _compliance
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(RESOLVER_KEY_COMPLIANCE) {
        ERC3643StorageWrapper.setCompliance(_compliance);
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_COMPLIANCE);
        emit IERC3643Types.ComplianceAdded(_compliance);
        emit ComplianceInitialized(_compliance);
    }

    /// @inheritdoc IComplianceFacet
    /// @dev Requires an operational, activated, unpaused token and `TREX_OWNER_ROLE`.
    function setCompliance(
        address _compliance
    ) external override onlyOperational onlyActivated onlyUnpaused onlyRole(ROLE_TREX_OWNER) {
        ERC3643StorageWrapper.setCompliance(_compliance);
        emit IERC3643Types.ComplianceAdded(_compliance);
    }

    /// @inheritdoc IComplianceFacet
    /// @dev Only available when multi-partition mode is disabled. Uses `msg.sender` as sender.
    function canTransfer(
        address _to,
        uint256 _value,
        bytes memory _data
    ) external view override onlyWithoutMultiPartition returns (bool, bytes1, bytes32) {
        if (PauseStorageWrapper.isPaused()) {
            return (false, Eip1066.PAUSED, IPause.IsPaused.selector);
        }
        (bool status, bytes1 statusCode, bytes32 reason, ) = ERC1594StorageWrapper.canTransferFromByPartition(
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
    /// @dev Only available when multi-partition mode is disabled.
    function canTransferFrom(
        address _from,
        address _to,
        uint256 _value,
        bytes memory _data
    ) external view override onlyWithoutMultiPartition returns (bool, bytes1, bytes32) {
        if (PauseStorageWrapper.isPaused()) {
            return (false, Eip1066.PAUSED, IPause.IsPaused.selector);
        }
        (bool status, bytes1 statusCode, bytes32 reason, ) = ERC1594StorageWrapper.canTransferFromByPartition(
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
