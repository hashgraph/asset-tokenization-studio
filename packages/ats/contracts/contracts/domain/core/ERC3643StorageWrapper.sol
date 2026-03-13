// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC3643_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { _AGENT_ROLE } from "../../constants/roles.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { IERC3643Management } from "../../facets/layer_1/ERC3643/IERC3643Management.sol";
import { IAccessControl } from "../../facets/layer_1/accessControl/IAccessControl.sol";
import { IERC3643StorageWrapper } from "../asset/ERC3643/IERC3643StorageWrapper.sol";
import { IIdentityRegistry } from "../../facets/layer_1/ERC3643/IIdentityRegistry.sol";
import { ICompliance } from "../../facets/layer_1/ERC3643/ICompliance.sol";
import { LowLevelCall } from "../../infrastructure/utils/LowLevelCall.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { AccessControlStorageWrapper } from "./AccessControlStorageWrapper.sol";
import { ControlListStorageWrapper } from "./ControlListStorageWrapper.sol";
import { ResolverProxyStorageWrapper } from "./ResolverProxyStorageWrapper.sol";
import { ERC20StorageWrapper } from "../asset/ERC20StorageWrapper.sol";
import { ERC1410StorageWrapper } from "../asset/ERC1410StorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../asset/SnapshotsStorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "../asset/AdjustBalancesStorageWrapper.sol";
import { LockStorageWrapper } from "../asset/LockStorageWrapper.sol";
import { HoldStorageWrapper } from "../asset/HoldStorageWrapper.sol";
import { ClearingStorageWrapper } from "../asset/ClearingStorageWrapper.sol";
import { TokenCoreOps } from "../orchestrator/TokenCoreOps.sol";

library ERC3643StorageWrapper {
    using LowLevelCall for address;

    // --- Initialization ---

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ERC3643(address _compliance, address _identityRegistry) internal {
        IERC3643Management.ERC3643Storage storage st = _erc3643Storage();
        st.initialized = true;
        _setCompliance(_compliance);
        _setIdentityRegistry(_identityRegistry);
    }

    // --- State-changing functions ---

    function _setAddressFrozen(address _userAddress, bool _freezeStatus) internal {
        if (_freezeStatus) {
            ControlListStorageWrapper._getControlListType()
                ? ControlListStorageWrapper._removeFromControlList(_userAddress)
                : ControlListStorageWrapper._addToControlList(_userAddress);
            return;
        }
        ControlListStorageWrapper._getControlListType()
            ? ControlListStorageWrapper._addToControlList(_userAddress)
            : ControlListStorageWrapper._removeFromControlList(_userAddress);
    }

    function _addAgent(address _agent) internal {
        if (!AccessControlStorageWrapper._grantRole(_AGENT_ROLE, _agent)) {
            revert IAccessControl.AccountAssignedToRole(_AGENT_ROLE, _agent);
        }
        emit IERC3643Management.AgentAdded(_agent);
    }

    function _removeAgent(address _agent) internal {
        if (!AccessControlStorageWrapper._revokeRole(_AGENT_ROLE, _agent)) {
            revert IAccessControl.AccountNotAssignedToRole(_AGENT_ROLE, _agent);
        }
        emit IERC3643Management.AgentRemoved(_agent);
    }

    function _setCompliance(address _compliance) internal {
        _erc3643Storage().compliance = _compliance;
        emit IERC3643StorageWrapper.ComplianceAdded(_compliance);
    }

    function _setIdentityRegistry(address _identityRegistry) internal {
        _erc3643Storage().identityRegistry = _identityRegistry;
        emit IERC3643Management.IdentityRegistryAdded(_identityRegistry);
    }

    function _setName(string calldata _name) internal {
        ERC20StorageWrapper.ERC20Storage storage erc20Storage_ = ERC20StorageWrapper._erc20Storage();
        erc20Storage_.name = _name;
        emit IERC3643Management.UpdatedTokenInformation(
            erc20Storage_.name,
            erc20Storage_.symbol,
            erc20Storage_.decimals,
            _version(),
            _erc3643Storage().onchainID
        );
    }

    function _setSymbol(string calldata _symbol) internal {
        ERC20StorageWrapper.ERC20Storage storage erc20Storage_ = ERC20StorageWrapper._erc20Storage();
        erc20Storage_.symbol = _symbol;
        emit IERC3643Management.UpdatedTokenInformation(
            erc20Storage_.name,
            erc20Storage_.symbol,
            erc20Storage_.decimals,
            _version(),
            _erc3643Storage().onchainID
        );
    }

    function _setOnchainID(address _onchainID) internal {
        ERC20StorageWrapper.ERC20Storage storage erc20Storage_ = ERC20StorageWrapper._erc20Storage();
        _erc3643Storage().onchainID = _onchainID;
        emit IERC3643Management.UpdatedTokenInformation(
            erc20Storage_.name,
            erc20Storage_.symbol,
            erc20Storage_.decimals,
            _version(),
            _onchainID
        );
    }

    function _freezeTokens(address _account, uint256 _amount) internal {
        _freezeTokensByPartition(_DEFAULT_PARTITION, _account, _amount);
    }

    function _unfreezeTokens(address _account, uint256 _amount, uint256 _timestamp) internal {
        _checkUnfreezeAmount(_DEFAULT_PARTITION, _account, _amount, _timestamp);
        _unfreezeTokensByPartition(_DEFAULT_PARTITION, _account, _amount);
    }

    function _freezeTokensByPartition(bytes32 _partition, address _account, uint256 _amount) internal {
        SnapshotsStorageWrapper.triggerAndSyncAll(_partition, _account, address(0));
        _updateTotalFreeze(_partition, _account);
        SnapshotsStorageWrapper._updateAccountSnapshot(_account, _partition);
        SnapshotsStorageWrapper._updateAccountFrozenBalancesSnapshot(_account, _partition);

        IERC3643Management.ERC3643Storage storage st = _erc3643Storage();
        st.frozenTokens[_account] += _amount;
        st.frozenTokensByPartition[_account][_partition] += _amount;

        ERC1410StorageWrapper._reduceBalanceByPartition(_account, _amount, _partition);
    }

    function _unfreezeTokensByPartition(bytes32 _partition, address _account, uint256 _amount) internal {
        SnapshotsStorageWrapper.triggerAndSyncAll(_partition, _account, address(0));
        _updateTotalFreeze(_partition, _account);
        SnapshotsStorageWrapper._updateAccountSnapshot(_account, _partition);
        SnapshotsStorageWrapper._updateAccountFrozenBalancesSnapshot(_account, _partition);

        IERC3643Management.ERC3643Storage storage st = _erc3643Storage();
        st.frozenTokens[_account] -= _amount;
        st.frozenTokensByPartition[_account][_partition] -= _amount;

        ERC1410StorageWrapper.transferFrozenBalance(_partition, _account, _amount);
    }

    function _updateTotalFreeze(bytes32 _partition, address _tokenHolder) internal returns (uint256 abaf_) {
        abaf_ = AdjustBalancesStorageWrapper._getAbaf();
        uint256 labaf = AdjustBalancesStorageWrapper._getTotalFrozenLabaf(_tokenHolder);
        uint256 labafByPartition = AdjustBalancesStorageWrapper._getTotalFrozenLabafByPartition(
            _partition,
            _tokenHolder
        );

        if (abaf_ != labaf) {
            uint256 factor = AdjustBalancesStorageWrapper._calculateFactor(abaf_, labaf);
            _updateTotalFreezeAmountAndLabaf(_tokenHolder, factor, abaf_);
        }

        if (abaf_ != labafByPartition) {
            uint256 factorByPartition = AdjustBalancesStorageWrapper._calculateFactor(abaf_, labafByPartition);
            _updateTotalFreezeAmountAndLabafByPartition(_partition, _tokenHolder, factorByPartition, abaf_);
        }
    }

    function _updateTotalFreezeAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal {
        _erc3643Storage().frozenTokens[_tokenHolder] *= _factor;
        AdjustBalancesStorageWrapper._setTotalFreezeLabaf(_tokenHolder, _abaf);
    }

    function _updateTotalFreezeAmountAndLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _factor,
        uint256 _abaf
    ) internal {
        _erc3643Storage().frozenTokensByPartition[_tokenHolder][_partition] *= _factor;
        AdjustBalancesStorageWrapper._setTotalFreezeLabafByPartition(_partition, _tokenHolder, _abaf);
    }

    function _recoveryAddress(
        address _lostWallet,
        address _newWallet,
        address _investorOnchainID,
        uint256 _timestamp
    ) internal returns (bool) {
        uint256 frozenBalance = _getFrozenAmountForAdjustedAt(_lostWallet, _timestamp);
        if (frozenBalance > 0) {
            _unfreezeTokens(_lostWallet, frozenBalance, _timestamp);
        }
        uint256 balance = ERC1410StorageWrapper._balanceOfAdjustedAt(_lostWallet, _timestamp);
        if (balance + frozenBalance > 0) {
            ERC1410StorageWrapper.transfer(_lostWallet, _newWallet, balance);
        }
        if (frozenBalance > 0) {
            _freezeTokens(_newWallet, frozenBalance);
        }
        if (ControlListStorageWrapper._isInControlList(_lostWallet)) {
            ControlListStorageWrapper._addToControlList(_newWallet);
        }
        _erc3643Storage().addressRecovered[_lostWallet] = true;
        _erc3643Storage().addressRecovered[_newWallet] = false;

        emit IERC3643Management.RecoverySuccess(_lostWallet, _newWallet, _investorOnchainID);
        return true;
    }

    // --- Guard functions ---

    function _requireUnrecoveredAddress(address _account) internal view {
        if (_isRecovered(_account)) revert IERC3643Management.WalletRecovered();
    }

    function _requireEmptyWallet(address _tokenHolder) internal view {
        if (!_canRecover(_tokenHolder)) revert IERC3643Management.CannotRecoverWallet();
    }

    // --- Read functions ---

    function _getFrozenAmountFor(address _userAddress) internal view returns (uint256) {
        return _erc3643Storage().frozenTokens[_userAddress];
    }

    function _getFrozenAmountForByPartition(bytes32 _partition, address _userAddress) internal view returns (uint256) {
        return _erc3643Storage().frozenTokensByPartition[_userAddress][_partition];
    }

    function _isRecovered(address _sender) internal view returns (bool) {
        return _erc3643Storage().addressRecovered[_sender];
    }

    function _version() internal view returns (string memory) {
        return
            string(
                abi.encodePacked(
                    // solhint-disable quotes
                    "{",
                    '"Resolver": "',
                    Strings.toHexString(uint160(address(ResolverProxyStorageWrapper._getBusinessLogicResolver())), 20),
                    '", ',
                    '"Config ID": "',
                    Strings.toHexString(uint256(ResolverProxyStorageWrapper._getResolverProxyConfigurationId()), 32),
                    '", ',
                    '"Version": "',
                    Strings.toString(ResolverProxyStorageWrapper._getResolverProxyVersion()),
                    '"',
                    "}"
                    // solhint-enable quotes
                )
            );
    }

    function _getCompliance() internal view returns (ICompliance) {
        return ICompliance(_erc3643Storage().compliance);
    }

    function _getIdentityRegistry() internal view returns (IIdentityRegistry) {
        return IIdentityRegistry(_erc3643Storage().identityRegistry);
    }

    function _getOnchainID() internal view returns (address) {
        return _erc3643Storage().onchainID;
    }

    function _isERC3643Initialized() internal view returns (bool) {
        return _erc3643Storage().initialized;
    }

    function _getFrozenAmountForAdjustedAt(address _tokenHolder, uint256 _timestamp) internal view returns (uint256) {
        uint256 factor = AdjustBalancesStorageWrapper._calculateFactorForFrozenAmountByTokenHolderAdjustedAt(
            _tokenHolder,
            _timestamp
        );
        return _getFrozenAmountFor(_tokenHolder) * factor;
    }

    function _getFrozenAmountForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256) {
        uint256 factor = AdjustBalancesStorageWrapper._calculateFactor(
            AdjustBalancesStorageWrapper._getAbafAdjustedAt(_timestamp),
            AdjustBalancesStorageWrapper._getTotalFrozenLabafByPartition(_partition, _tokenHolder)
        );
        return _getFrozenAmountForByPartition(_partition, _tokenHolder) * factor;
    }

    function _getTotalBalanceForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256) {
        return
            TokenCoreOps._getTotalBalanceForByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp) +
            _getFrozenAmountForByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp);
    }

    function _getTotalBalanceForAdjustedAt(address _tokenHolder, uint256 _timestamp) internal view returns (uint256) {
        return
            TokenCoreOps._getTotalBalanceForAdjustedAt(_tokenHolder, _timestamp) +
            _getFrozenAmountForAdjustedAt(_tokenHolder, _timestamp);
    }

    function _canRecover(address _tokenHolder) internal view returns (bool isEmpty_) {
        isEmpty_ =
            LockStorageWrapper._getLockedAmountFor(_tokenHolder) +
                HoldStorageWrapper._getHeldAmountFor(_tokenHolder) +
                ClearingStorageWrapper._getClearedAmountFor(_tokenHolder) ==
            0;
    }

    // --- Pure functions (before private helpers per solhint ordering) ---

    function _erc3643Storage() internal pure returns (IERC3643Management.ERC3643Storage storage erc3643Storage_) {
        bytes32 position = _ERC3643_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc3643Storage_.slot := position
        }
    }

    function _requireValidInputAmountsArrayLength(
        address[] memory _addresses,
        uint256[] memory _amounts
    ) internal pure {
        if (_addresses.length != _amounts.length) {
            revert IERC3643Management.InputAmountsArrayLengthMismatch();
        }
    }

    function _requireValidInputBoolArrayLength(address[] memory _addresses, bool[] memory _status) internal pure {
        if (_addresses.length != _status.length) {
            revert IERC3643Management.InputBoolArrayLengthMismatch();
        }
    }

    // --- Private helpers ---

    function _checkUnfreezeAmount(
        bytes32 _partition,
        address _userAddress,
        uint256 _amount,
        uint256 _timestamp
    ) private view {
        uint256 frozenAmount = _getFrozenAmountForByPartitionAdjustedAt(_partition, _userAddress, _timestamp);
        if (frozenAmount < _amount) {
            revert IERC3643StorageWrapper.InsufficientFrozenBalance(_userAddress, _amount, frozenAmount, _partition);
        }
    }
}
