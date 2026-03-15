// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _AGENT_ROLE, _TREX_OWNER_ROLE } from "../../../constants/roles.sol";
import { IERC3643Management } from "./IERC3643Management.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../../domain/core/ERC3643StorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";

abstract contract ERC3643Management is IERC3643Management, PauseStorageWrapper {
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC3643(address _compliance, address _identityRegistry) external {
        if (ERC3643StorageWrapper.isERC3643Initialized()) revert AlreadyInitialized();
        ERC3643StorageWrapper.initialize_ERC3643(_compliance, _identityRegistry);
    }

    function setName(string calldata _name) external override onlyUnpaused {
        AccessControlStorageWrapper.checkRole(_TREX_OWNER_ROLE, msg.sender);
        ERC3643StorageWrapper.setName(_name);
    }

    function setSymbol(string calldata _symbol) external override onlyUnpaused {
        AccessControlStorageWrapper.checkRole(_TREX_OWNER_ROLE, msg.sender);
        ERC3643StorageWrapper.setSymbol(_symbol);
    }

    function setOnchainID(address _onchainID) external override onlyUnpaused {
        AccessControlStorageWrapper.checkRole(_TREX_OWNER_ROLE, msg.sender);
        ERC3643StorageWrapper.setOnchainID(_onchainID);
    }

    function setIdentityRegistry(address _identityRegistry) external override onlyUnpaused {
        AccessControlStorageWrapper.checkRole(_TREX_OWNER_ROLE, msg.sender);
        ERC3643StorageWrapper.setIdentityRegistry(_identityRegistry);
    }

    function setCompliance(address _compliance) external override onlyUnpaused {
        AccessControlStorageWrapper.checkRole(_TREX_OWNER_ROLE, msg.sender);
        ERC3643StorageWrapper.setCompliance(_compliance);
    }

    function addAgent(address _agent) external onlyUnpaused {
        AccessControlStorageWrapper.checkRole(AccessControlStorageWrapper.getRoleAdmin(_AGENT_ROLE), msg.sender);
        ERC3643StorageWrapper.addAgent(_agent);
    }

    function removeAgent(address _agent) external onlyUnpaused {
        AccessControlStorageWrapper.checkRole(AccessControlStorageWrapper.getRoleAdmin(_AGENT_ROLE), msg.sender);
        ERC3643StorageWrapper.removeAgent(_agent);
    }

    function recoveryAddress(
        address _lostWallet,
        address _newWallet,
        address _investorOnchainID
    ) external returns (bool success_) {
        ERC3643StorageWrapper.requireUnrecoveredAddress(_lostWallet);
        AccessControlStorageWrapper.checkRole(_AGENT_ROLE, msg.sender);
        ERC3643StorageWrapper.requireEmptyWallet(_lostWallet);
        ERC1410StorageWrapper.requireWithoutMultiPartition();
        success_ = ERC3643StorageWrapper.recoveryAddress(_lostWallet, _newWallet, _investorOnchainID, block.timestamp);
    }
}
