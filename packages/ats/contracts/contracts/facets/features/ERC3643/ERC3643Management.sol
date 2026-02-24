// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Management } from "../interfaces/ERC3643/IERC3643Management.sol";
import { IAccessControl } from "../interfaces/IAccessControl.sol";
import { _AGENT_ROLE, _TREX_OWNER_ROLE } from "../../../constants/roles.sol";
import { _DEFAULT_PARTITION } from "../../../constants/values.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibCompliance } from "../../../lib/core/LibCompliance.sol";
import { LibControlList } from "../../../lib/core/LibControlList.sol";
import { LibERC20 } from "../../../lib/domain/LibERC20.sol";
import { LibERC1410 } from "../../../lib/domain/LibERC1410.sol";
import { LibABAF } from "../../../lib/domain/LibABAF.sol";
import { LibFreeze } from "../../../lib/domain/LibFreeze.sol";
import { LibSnapshots } from "../../../lib/domain/LibSnapshots.sol";
import { LibHold } from "../../../lib/domain/LibHold.sol";
import { LibLock } from "../../../lib/domain/LibLock.sol";
import { LibClearing } from "../../../lib/domain/LibClearing.sol";
import { TokenCoreOps } from "../../../lib/orchestrator/TokenCoreOps.sol";
import { LibResolverProxy } from "../../../infrastructure/proxy/LibResolverProxy.sol";
import { LibTimeTravel } from "../../../test/timeTravel/LibTimeTravel.sol";

abstract contract ERC3643Management is IERC3643Management {
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC3643(address _compliance, address _identityRegistry) external {
        if (LibCompliance.isERC3643Initialized()) revert AlreadyInitialized();
        LibCompliance.setERC3643Initialized(true);
        LibCompliance.setCompliance(_compliance);
        LibCompliance.setIdentityRegistry(_identityRegistry);
    }

    function setName(string calldata _name) external override {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_TREX_OWNER_ROLE);
        LibERC20.setName(_name);
        _emitUpdatedTokenInformation();
    }

    function setSymbol(string calldata _symbol) external override {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_TREX_OWNER_ROLE);
        LibERC20.setSymbol(_symbol);
        _emitUpdatedTokenInformation();
    }

    function setOnchainID(address _onchainID) external override {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_TREX_OWNER_ROLE);
        LibCompliance.setOnchainID(_onchainID);
        _emitUpdatedTokenInformation();
    }

    function setIdentityRegistry(address _identityRegistry) external override {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_TREX_OWNER_ROLE);
        LibCompliance.setIdentityRegistry(_identityRegistry);
    }

    function setCompliance(address _compliance) external override {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_TREX_OWNER_ROLE);
        LibCompliance.setCompliance(_compliance);
    }

    function addAgent(address _agent) external {
        LibAccess.checkRole(LibAccess.getRoleAdmin(_AGENT_ROLE));
        LibPause.requireNotPaused();
        if (!LibAccess.grantRole(_AGENT_ROLE, _agent)) {
            revert IAccessControl.AccountAssignedToRole(_AGENT_ROLE, _agent);
        }
        emit AgentAdded(_agent);
    }

    function removeAgent(address _agent) external {
        LibAccess.checkRole(LibAccess.getRoleAdmin(_AGENT_ROLE));
        LibPause.requireNotPaused();
        if (!LibAccess.revokeRole(_AGENT_ROLE, _agent)) {
            revert IAccessControl.AccountNotAssignedToRole(_AGENT_ROLE, _agent);
        }
        emit AgentRemoved(_agent);
    }

    function recoveryAddress(
        address _lostWallet,
        address _newWallet,
        address _investorOnchainID
    ) external returns (bool success_) {
        LibCompliance.requireNotRecovered(_lostWallet);
        LibAccess.checkRole(_AGENT_ROLE);
        if (!_canRecover(_lostWallet)) revert CannotRecoverWallet();
        LibERC1410.checkWithoutMultiPartition();

        uint256 timestamp = LibTimeTravel.getBlockTimestamp();
        uint256 frozenBalance = LibFreeze.getFrozenAmountAdjustedAt(_lostWallet, timestamp);

        if (frozenBalance > 0) {
            _unfreezeTokens(_lostWallet, frozenBalance);
        }

        uint256 balance = LibABAF.balanceOfAdjustedAt(_lostWallet, timestamp);
        if (balance + frozenBalance > 0) {
            TokenCoreOps.transfer(_lostWallet, _newWallet, balance, timestamp);
        }

        if (frozenBalance > 0) {
            _freezeTokens(_newWallet, frozenBalance);
        }

        if (LibControlList.isInControlList(_lostWallet)) {
            LibControlList.addToControlList(_newWallet);
        }

        LibCompliance.setRecovered(_lostWallet, true);
        LibCompliance.setRecovered(_newWallet, false);

        emit RecoverySuccess(_lostWallet, _newWallet, _investorOnchainID);
        success_ = true;
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ════════════════════════════════════════════════════════════════════════════════════

    function _unfreezeTokens(address _account, uint256 _amount) private {
        LibFreeze.checkUnfreezeAmount(_DEFAULT_PARTITION, _account, _amount);
        _unfreezeTokensByPartition(_DEFAULT_PARTITION, _account, _amount);
    }

    function _freezeTokens(address _account, uint256 _amount) private {
        _freezeTokensByPartition(_DEFAULT_PARTITION, _account, _amount);
    }

    function _freezeTokensByPartition(bytes32 _partition, address _account, uint256 _amount) private {
        LibABAF.triggerAndSyncAll(_partition, _account, address(0));
        LibFreeze.updateTotalFreeze(_partition, _account);
        LibSnapshots.updateAccountSnapshot(_account, _partition);
        LibSnapshots.updateAccountFrozenBalancesSnapshot(_account, _partition);
        LibFreeze.freezeTokensByPartition(_partition, _account, _amount);
        LibERC1410.reduceBalanceByPartition(_account, _amount, _partition);
    }

    function _unfreezeTokensByPartition(bytes32 _partition, address _account, uint256 _amount) private {
        LibABAF.triggerAndSyncAll(_partition, _account, address(0));
        LibFreeze.updateTotalFreeze(_partition, _account);
        LibSnapshots.updateAccountSnapshot(_account, _partition);
        LibSnapshots.updateAccountFrozenBalancesSnapshot(_account, _partition);
        LibFreeze.unfreezeTokensByPartition(_partition, _account, _amount);
        if (LibERC1410.validPartitionForReceiver(_partition, _account)) {
            LibERC1410.increaseBalanceByPartition(_account, _amount, _partition);
        } else {
            LibERC1410.addPartitionTo(_amount, _account, _partition);
        }
    }

    function _emitUpdatedTokenInformation() private {
        emit UpdatedTokenInformation(
            LibERC20.getName(),
            LibERC20.getSymbol(),
            LibERC20.getDecimals(),
            LibResolverProxy.version(),
            LibCompliance.getOnchainID()
        );
    }

    function _canRecover(address _tokenHolder) private view returns (bool) {
        return
            LibLock.getLockedAmountFor(_tokenHolder) +
                LibHold.getHeldAmountFor(_tokenHolder) +
                LibClearing.getClearedAmount(_tokenHolder) ==
            0;
    }
}
