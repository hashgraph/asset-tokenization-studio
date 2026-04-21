// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length

import { _AGENT_ROLE, _TREX_OWNER_ROLE } from "../../../constants/roles.sol";
import { IERC3643Types } from "./IERC3643Types.sol";
import { IERC3643Management } from "./IERC3643Management.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ERC3643StorageWrapper } from "../../../domain/core/ERC3643StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

abstract contract ERC3643Management is IERC3643Management, Modifiers {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC3643(address _compliance, address _identityRegistry) external onlyNotERC3643Initialized {
        ERC3643StorageWrapper.initialize_ERC3643(_compliance, _identityRegistry);
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

    function addAgent(
        address _agent
    ) external onlyUnpaused onlyRole(AccessControlStorageWrapper.getRoleAdmin(_AGENT_ROLE)) {
        ERC3643StorageWrapper.addAgent(_agent);
        emit IERC3643Types.AgentAdded(_agent);
    }

    function removeAgent(
        address _agent
    ) external onlyUnpaused onlyRole(AccessControlStorageWrapper.getRoleAdmin(_AGENT_ROLE)) {
        ERC3643StorageWrapper.removeAgent(_agent);
        emit IERC3643Types.AgentRemoved(_agent);
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
        onlyWithoutMultiPartition
        returns (bool success_)
    {
        success_ = ERC3643StorageWrapper.recoveryAddress(
            _lostWallet,
            _newWallet,
            _investorOnchainID,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );
    }
}
