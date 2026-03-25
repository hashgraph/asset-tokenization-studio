// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _AGENT_ROLE, _TREX_OWNER_ROLE } from "../../../constants/roles.sol";
import { IERC3643Management } from "./IERC3643Management.sol";
import { IERC3643StorageWrapper } from "../../../domain/asset/ERC3643/IERC3643StorageWrapper.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { AccessControlModifiers } from "../../../infrastructure/utils/AccessControlModifiers.sol";
import { PauseModifiers } from "../../../domain/core/PauseModifiers.sol";
import { ERC3643StorageWrapper } from "../../../domain/core/ERC3643StorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { _checkNotInitialized } from "../../../services/InitializationErrors.sol";
import { ERC3643Modifiers } from "../../../infrastructure/utils/ERC3643Modifiers.sol";
import { TimeTravelStorageWrapper } from "../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

abstract contract ERC3643Management is IERC3643Management, AccessControlModifiers, PauseModifiers, ERC3643Modifiers {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC3643(address _compliance, address _identityRegistry) external {
        _checkNotInitialized(ERC3643StorageWrapper.isERC3643Initialized());
        ERC3643StorageWrapper.initialize_ERC3643(_compliance, _identityRegistry);
    }

    function setName(string calldata _name) external override onlyUnpaused onlyRole(_TREX_OWNER_ROLE) {
        ERC3643StorageWrapper.setName(_name);
    }

    function setSymbol(string calldata _symbol) external override onlyUnpaused onlyRole(_TREX_OWNER_ROLE) {
        ERC3643StorageWrapper.setSymbol(_symbol);
    }

    function setOnchainID(address _onchainID) external override onlyUnpaused onlyRole(_TREX_OWNER_ROLE) {
        ERC3643StorageWrapper.setOnchainID(_onchainID);
    }

    function setIdentityRegistry(address _identityRegistry) external override onlyUnpaused onlyRole(_TREX_OWNER_ROLE) {
        ERC3643StorageWrapper.setIdentityRegistry(_identityRegistry);
    }

    function setCompliance(address _compliance) external override onlyUnpaused onlyRole(_TREX_OWNER_ROLE) {
        ERC3643StorageWrapper.setCompliance(_compliance);
    }

    function addAgent(address _agent) external onlyRole(AccessControlStorageWrapper.getRoleAdmin(_AGENT_ROLE)) {
        AccessControlStorageWrapper.grantRole(_AGENT_ROLE, _agent);
        emit AgentAdded(_agent);
    }

    function removeAgent(address _agent) external onlyRole(AccessControlStorageWrapper.getRoleAdmin(_AGENT_ROLE)) {
        AccessControlStorageWrapper.revokeRole(_AGENT_ROLE, _agent);
        emit AgentRemoved(_agent);
    }

    function recoveryAddress(
        address _lostWallet,
        address _newWallet,
        address _investorOnchainID
    )
        external
        override
        onlyRole(_AGENT_ROLE)
        onlyUnrecoveredAddress(_lostWallet)
        onlyEmptyWallet(_lostWallet)
        returns (bool success_)
    {
        ERC1410StorageWrapper.requireWithoutMultiPartition();
        success_ = ERC3643StorageWrapper.recoveryAddress(
            _lostWallet,
            _newWallet,
            _investorOnchainID,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );
    }
}
