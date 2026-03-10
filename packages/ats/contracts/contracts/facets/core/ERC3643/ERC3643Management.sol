// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Management } from "../ERC3643/IERC3643Management.sol";
import { IAccessControl } from "../accessControl/IAccessControl.sol";
import { _AGENT_ROLE, _TREX_OWNER_ROLE } from "../../../constants/roles.sol";
import { _DEFAULT_PARTITION } from "../../../constants/values.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../domain/core/AccessStorageWrapper.sol";
import { ComplianceStorageWrapper } from "../../../domain/core/ComplianceStorageWrapper.sol";
import { ControlListStorageWrapper } from "../../../domain/core/ControlListStorageWrapper.sol";
import { ERC20StorageWrapper } from "../../../domain/asset/ERC20StorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ABAFStorageWrapper } from "../../../domain/asset/ABAFStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../../../domain/asset/SnapshotsStorageWrapper.sol";
import { HoldStorageWrapper } from "../../../domain/asset/HoldStorageWrapper.sol";
import { LockStorageWrapper } from "../../../domain/asset/LockStorageWrapper.sol";
import { ClearingStorageWrapper } from "../../../domain/asset/ClearingStorageWrapper.sol";
import { TokenCoreOps } from "../../../domain/orchestrator/TokenCoreOps.sol";
import { ResolverProxyStorageWrapper } from "../../../infrastructure/proxy/ResolverProxyStorageWrapper.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";

abstract contract ERC3643Management is IERC3643Management, TimestampProvider {
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC3643(address _compliance, address _identityRegistry) external {
        if (ComplianceStorageWrapper.isERC3643Initialized()) revert AlreadyInitialized();
        ComplianceStorageWrapper.setERC3643Initialized(true);
        ComplianceStorageWrapper.setCompliance(_compliance);
        ComplianceStorageWrapper.setIdentityRegistry(_identityRegistry);
    }

    function setName(string calldata _name) external override {
        PauseStorageWrapper.requireNotPaused();
        AccessStorageWrapper.checkRole(_TREX_OWNER_ROLE);
        ERC20StorageWrapper.setName(_name);
        _emitUpdatedTokenInformation();
    }

    function setSymbol(string calldata _symbol) external override {
        PauseStorageWrapper.requireNotPaused();
        AccessStorageWrapper.checkRole(_TREX_OWNER_ROLE);
        ERC20StorageWrapper.setSymbol(_symbol);
        _emitUpdatedTokenInformation();
    }

    function setOnchainID(address _onchainID) external override {
        PauseStorageWrapper.requireNotPaused();
        AccessStorageWrapper.checkRole(_TREX_OWNER_ROLE);
        ComplianceStorageWrapper.setOnchainID(_onchainID);
        _emitUpdatedTokenInformation();
    }

    function setIdentityRegistry(address _identityRegistry) external override {
        PauseStorageWrapper.requireNotPaused();
        AccessStorageWrapper.checkRole(_TREX_OWNER_ROLE);
        ComplianceStorageWrapper.setIdentityRegistry(_identityRegistry);
    }

    function setCompliance(address _compliance) external override {
        PauseStorageWrapper.requireNotPaused();
        AccessStorageWrapper.checkRole(_TREX_OWNER_ROLE);
        ComplianceStorageWrapper.setCompliance(_compliance);
    }

    function addAgent(address _agent) external {
        AccessStorageWrapper.checkRole(AccessStorageWrapper.getRoleAdmin(_AGENT_ROLE));
        PauseStorageWrapper.requireNotPaused();
        if (!AccessStorageWrapper.grantRole(_AGENT_ROLE, _agent)) {
            revert IAccessControl.AccountAssignedToRole(_AGENT_ROLE, _agent);
        }
        emit AgentAdded(_agent);
    }

    function removeAgent(address _agent) external {
        AccessStorageWrapper.checkRole(AccessStorageWrapper.getRoleAdmin(_AGENT_ROLE));
        PauseStorageWrapper.requireNotPaused();
        if (!AccessStorageWrapper.revokeRole(_AGENT_ROLE, _agent)) {
            revert IAccessControl.AccountNotAssignedToRole(_AGENT_ROLE, _agent);
        }
        emit AgentRemoved(_agent);
    }

    function recoveryAddress(
        address _lostWallet,
        address _newWallet,
        address _investorOnchainID
    ) external returns (bool success_) {
        ComplianceStorageWrapper.requireNotRecovered(_lostWallet);
        AccessStorageWrapper.checkRole(_AGENT_ROLE);
        if (!_canRecover(_lostWallet)) revert CannotRecoverWallet();
        ERC1410StorageWrapper.checkWithoutMultiPartition();

        uint256 timestamp = _getBlockTimestamp();
        uint256 frozenBalance = ComplianceStorageWrapper.getFrozenAmountAdjustedAt(_lostWallet, timestamp);

        if (frozenBalance > 0) {
            _unfreezeTokens(_lostWallet, frozenBalance);
        }

        uint256 balance = ABAFStorageWrapper.balanceOfAdjustedAt(_lostWallet, timestamp);
        if (balance + frozenBalance > 0) {
            TokenCoreOps.transfer(_lostWallet, _newWallet, balance, timestamp, _getBlockNumber());
        }

        if (frozenBalance > 0) {
            _freezeTokens(_newWallet, frozenBalance);
        }

        if (ControlListStorageWrapper.isInControlList(_lostWallet)) {
            ControlListStorageWrapper.addToControlList(_newWallet);
        }

        ComplianceStorageWrapper.setRecovered(_lostWallet, true);
        ComplianceStorageWrapper.setRecovered(_newWallet, false);

        emit RecoverySuccess(_lostWallet, _newWallet, _investorOnchainID);
        success_ = true;
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ════════════════════════════════════════════════════════════════════════════════════

    function _unfreezeTokens(address _account, uint256 _amount) private {
        ComplianceStorageWrapper.checkUnfreezeAmount(_DEFAULT_PARTITION, _account, _amount);
        _unfreezeTokensByPartition(_DEFAULT_PARTITION, _account, _amount);
    }

    function _freezeTokens(address _account, uint256 _amount) private {
        _freezeTokensByPartition(_DEFAULT_PARTITION, _account, _amount);
    }

    function _freezeTokensByPartition(bytes32 _partition, address _account, uint256 _amount) private {
        ABAFStorageWrapper.triggerAndSyncAll(_partition, _account, address(0));
        ComplianceStorageWrapper.updateTotalFreeze(_partition, _account);
        SnapshotsStorageWrapper.updateAccountSnapshot(_account, _partition);
        SnapshotsStorageWrapper.updateAccountFrozenBalancesSnapshot(_account, _partition);
        ComplianceStorageWrapper.freezeTokensByPartition(_partition, _account, _amount);
        ERC1410StorageWrapper.reduceBalanceByPartition(_account, _amount, _partition);
    }

    function _unfreezeTokensByPartition(bytes32 _partition, address _account, uint256 _amount) private {
        ABAFStorageWrapper.triggerAndSyncAll(_partition, _account, address(0));
        ComplianceStorageWrapper.updateTotalFreeze(_partition, _account);
        SnapshotsStorageWrapper.updateAccountSnapshot(_account, _partition);
        SnapshotsStorageWrapper.updateAccountFrozenBalancesSnapshot(_account, _partition);
        ComplianceStorageWrapper.unfreezeTokensByPartition(_partition, _account, _amount);
        if (ERC1410StorageWrapper.validPartitionForReceiver(_partition, _account)) {
            ERC1410StorageWrapper.increaseBalanceByPartition(_account, _amount, _partition);
        } else {
            ERC1410StorageWrapper.addPartitionTo(_amount, _account, _partition);
        }
    }

    function _emitUpdatedTokenInformation() private {
        emit UpdatedTokenInformation(
            ERC20StorageWrapper.getName(),
            ERC20StorageWrapper.getSymbol(),
            ERC20StorageWrapper.getDecimals(),
            ResolverProxyStorageWrapper.version(),
            ComplianceStorageWrapper.getOnchainID()
        );
    }

    function _canRecover(address _tokenHolder) private view returns (bool) {
        return
            LockStorageWrapper.getLockedAmountFor(_tokenHolder) +
                HoldStorageWrapper.getHeldAmountFor(_tokenHolder) +
                ClearingStorageWrapper.getClearedAmount(_tokenHolder) ==
            0;
    }
}
