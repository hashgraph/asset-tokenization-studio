// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _AGENT_ROLE, _TREX_OWNER_ROLE } from "../../../constants/roles.sol";
import { IERC3643Management } from "./IERC3643Management.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../../domain/core/ERC3643StorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";

abstract contract ERC3643Management is IERC3643Management {
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC3643(address _compliance, address _identityRegistry) external {
        if (ERC3643StorageWrapper._isERC3643Initialized()) revert AlreadyInitialized();
        ERC3643StorageWrapper._initialize_ERC3643(_compliance, _identityRegistry);
    }

    function setName(string calldata _name) external override {
        PauseStorageWrapper._requireNotPaused();
        AccessControlStorageWrapper._checkRole(_TREX_OWNER_ROLE, msg.sender);
        ERC3643StorageWrapper._setName(_name);
    }

    function setSymbol(string calldata _symbol) external override {
        PauseStorageWrapper._requireNotPaused();
        AccessControlStorageWrapper._checkRole(_TREX_OWNER_ROLE, msg.sender);
        ERC3643StorageWrapper._setSymbol(_symbol);
    }

    function setOnchainID(address _onchainID) external override {
        PauseStorageWrapper._requireNotPaused();
        AccessControlStorageWrapper._checkRole(_TREX_OWNER_ROLE, msg.sender);
        ERC3643StorageWrapper._setOnchainID(_onchainID);
    }

    function setIdentityRegistry(address _identityRegistry) external override {
        PauseStorageWrapper._requireNotPaused();
        AccessControlStorageWrapper._checkRole(_TREX_OWNER_ROLE, msg.sender);
        ERC3643StorageWrapper._setIdentityRegistry(_identityRegistry);
    }

    function setCompliance(address _compliance) external override {
        PauseStorageWrapper._requireNotPaused();
        AccessControlStorageWrapper._checkRole(_TREX_OWNER_ROLE, msg.sender);
        ERC3643StorageWrapper._setCompliance(_compliance);
    }

    function addAgent(address _agent) external {
        AccessControlStorageWrapper._checkRole(AccessControlStorageWrapper._getRoleAdmin(_AGENT_ROLE), msg.sender);
        PauseStorageWrapper._requireNotPaused();
        ERC3643StorageWrapper._addAgent(_agent);
    }

    function removeAgent(address _agent) external {
        AccessControlStorageWrapper._checkRole(AccessControlStorageWrapper._getRoleAdmin(_AGENT_ROLE), msg.sender);
        PauseStorageWrapper._requireNotPaused();
        ERC3643StorageWrapper._removeAgent(_agent);
    }

    function recoveryAddress(
        address _lostWallet,
        address _newWallet,
        address _investorOnchainID
    ) external returns (bool success_) {
        ERC3643StorageWrapper._requireUnrecoveredAddress(_lostWallet);
        AccessControlStorageWrapper._checkRole(_AGENT_ROLE, msg.sender);
        ERC3643StorageWrapper._requireEmptyWallet(_lostWallet);
        ERC1410StorageWrapper._requireWithoutMultiPartition();
        success_ = ERC3643StorageWrapper._recoveryAddress(_lostWallet, _newWallet, _investorOnchainID);
    }
}
