// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC3643_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { AGENT_ROLE } from "../../constants/roles.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { IERC3643Types } from "../../facets/layer_1/ERC3643/IERC3643Types.sol";
import { IAccessControl } from "../../facets/layer_1/accessControl/IAccessControl.sol";
import { IIdentityRegistry } from "../../facets/layer_1/ERC3643/IIdentityRegistry.sol";
import { ICompliance } from "../../facets/layer_1/ERC3643/ICompliance.sol";
import { LowLevelCall } from "../../infrastructure/utils/LowLevelCall.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { AccessControlStorageWrapper } from "./AccessControlStorageWrapper.sol";
import { ControlListStorageWrapper } from "./ControlListStorageWrapper.sol";
import { ResolverProxyStorageWrapper } from "./ResolverProxyStorageWrapper.sol";
import { ERC20StorageWrapper, ERC20Storage } from "../asset/ERC20StorageWrapper.sol";
import { ERC1410StorageWrapper } from "../asset/ERC1410StorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../asset/SnapshotsStorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "../asset/AdjustBalancesStorageWrapper.sol";
import { LockStorageWrapper } from "../asset/LockStorageWrapper.sol";
import { HoldStorageWrapper } from "../asset/HoldStorageWrapper.sol";
import { ClearingStorageWrapper } from "../asset/ClearingStorageWrapper.sol";
import { TokenCoreOps } from "../orchestrator/TokenCoreOps.sol";
import { ITransfer } from "../../facets/transfer/ITransfer.sol";

/**
 * @title ERC3643StorageWrapper
 * @notice Library that encapsulates storage management and core operations for an
 *         ERC3643-compliant token, including freeze/unfreeze, agent management,
 *         compliance, identity registry, and wallet recovery.
 * @dev All state mutations are performed via the diamond storage pattern,
 *      using a dedicated struct stored at a fixed EIP-1967 slot.
 *      This library is intended to be consumed by an upstream facet or orchestrator.
 * @author Asset Tokenization Studio Team
 */
library ERC3643StorageWrapper {
    using LowLevelCall for address;
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    struct ERC3643Storage {
        address onchainID;
        address identityRegistry;
        address compliance;
        mapping(address => uint256) frozenTokens;
        mapping(address => mapping(bytes32 => uint256)) frozenTokensByPartition;
        mapping(address => bool) addressRecovered;
        bool initialized;
    }

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC3643(address _compliance, address _identityRegistry) internal {
        erc3643Storage().initialized = true;
        setCompliance(_compliance);
        setIdentityRegistry(_identityRegistry);
    }

    function setAddressFrozen(address _userAddress, bool _freezeStatus) internal {
        if (_freezeStatus) {
            ControlListStorageWrapper.getControlListType()
                ? ControlListStorageWrapper.removeFromControlList(_userAddress)
                : ControlListStorageWrapper.addToControlList(_userAddress);
            return;
        }
        ControlListStorageWrapper.getControlListType()
            ? ControlListStorageWrapper.addToControlList(_userAddress)
            : ControlListStorageWrapper.removeFromControlList(_userAddress);
    }

    function addAgent(address _agent) internal {
        if (!AccessControlStorageWrapper.grantRole(AGENT_ROLE, _agent)) {
            revert IAccessControl.AccountAssignedToRole(AGENT_ROLE, _agent);
        }
    }

    function removeAgent(address _agent) internal {
        if (!AccessControlStorageWrapper.revokeRole(AGENT_ROLE, _agent)) {
            revert IAccessControl.AccountNotAssignedToRole(AGENT_ROLE, _agent);
        }
    }

    function setCompliance(address _compliance) internal {
        erc3643Storage().compliance = _compliance;
        emit IERC3643Types.ComplianceAdded(_compliance);
    }

    function setIdentityRegistry(address _identityRegistry) internal {
        erc3643Storage().identityRegistry = _identityRegistry;
        emit IERC3643Types.IdentityRegistryAdded(_identityRegistry);
    }

    function setName(string calldata _name) internal {
        ERC20Storage storage erc20Storage_ = ERC20StorageWrapper.erc20Storage();
        erc20Storage_.name = _name;
        emit IERC3643Types.UpdatedTokenInformation(
            erc20Storage_.name,
            erc20Storage_.symbol,
            erc20Storage_.decimals,
            version(),
            erc3643Storage().onchainID
        );
    }

    function setSymbol(string calldata _symbol) internal {
        ERC20Storage storage erc20Storage_ = ERC20StorageWrapper.erc20Storage();
        erc20Storage_.symbol = _symbol;
        emit IERC3643Types.UpdatedTokenInformation(
            erc20Storage_.name,
            erc20Storage_.symbol,
            erc20Storage_.decimals,
            version(),
            erc3643Storage().onchainID
        );
    }

    function setOnchainID(address _onchainID) internal {
        ERC20Storage storage erc20Storage_ = ERC20StorageWrapper.erc20Storage();
        erc3643Storage().onchainID = _onchainID;
        emit IERC3643Types.UpdatedTokenInformation(
            erc20Storage_.name,
            erc20Storage_.symbol,
            erc20Storage_.decimals,
            version(),
            _onchainID
        );
    }

    function freezeTokens(address _account, uint256 _amount) internal {
        freezeTokensByPartition(_DEFAULT_PARTITION, _account, _amount);
    }

    function unfreezeTokens(address _account, uint256 _amount, uint256 _timestamp) internal {
        _checkUnfreezeAmount(_DEFAULT_PARTITION, _account, _amount, _timestamp);
        unfreezeTokensByPartition(_DEFAULT_PARTITION, _account, _amount);
    }

    function freezeTokensByPartition(bytes32 _partition, address _account, uint256 _amount) internal {
        ERC1410StorageWrapper.triggerAndSyncAll(_partition, _account, address(0));
        updateTotalFreeze(_partition, _account);
        SnapshotsStorageWrapper.updateAccountSnapshot(_account, _partition);
        SnapshotsStorageWrapper.updateAccountFrozenBalancesSnapshot(_account, _partition);

        ERC3643Storage storage st = erc3643Storage();
        st.frozenTokens[_account] += _amount;
        st.frozenTokensByPartition[_account][_partition] += _amount;

        ERC1410StorageWrapper.reduceBalanceByPartition(_account, _amount, _partition);

        emit ITransfer.Transfer(_account, address(0), _amount);
    }

    function unfreezeTokensByPartition(bytes32 _partition, address _account, uint256 _amount) internal {
        ERC1410StorageWrapper.triggerAndSyncAll(_partition, _account, address(0));
        updateTotalFreeze(_partition, _account);
        SnapshotsStorageWrapper.updateAccountSnapshot(_account, _partition);
        SnapshotsStorageWrapper.updateAccountFrozenBalancesSnapshot(_account, _partition);

        ERC3643Storage storage st = erc3643Storage();
        st.frozenTokens[_account] -= _amount;
        st.frozenTokensByPartition[_account][_partition] -= _amount;

        transferFrozenBalance(_partition, _account, _amount);
        emit ITransfer.Transfer(address(0), _account, _amount);
    }

    function transferFrozenBalance(bytes32 _partition, address _to, uint256 _amount) internal {
        if (ERC1410StorageWrapper.validPartitionForReceiver(_partition, _to)) {
            ERC1410StorageWrapper.increaseBalanceByPartition(_to, _amount, _partition);
            return;
        }
        ERC1410StorageWrapper.addPartitionTo(_amount, _to, _partition);
    }

    function updateTotalFreeze(bytes32 _partition, address _tokenHolder) internal returns (uint256 abaf_) {
        abaf_ = AdjustBalancesStorageWrapper.getAbaf();
        uint256 labaf = AdjustBalancesStorageWrapper.getTotalFrozenLabaf(_tokenHolder);
        uint256 labafByPartition = AdjustBalancesStorageWrapper.getTotalFrozenLabafByPartition(
            _partition,
            _tokenHolder
        );

        if (abaf_ != labaf) {
            updateTotalFreezeAmountAndLabaf(
                _tokenHolder,
                AdjustBalancesStorageWrapper.calculateFactor(abaf_, labaf),
                abaf_
            );
        }

        if (abaf_ != labafByPartition) {
            updateTotalFreezeAmountAndLabafByPartition(
                _partition,
                _tokenHolder,
                AdjustBalancesStorageWrapper.calculateFactor(abaf_, labafByPartition),
                abaf_
            );
        }
    }

    function updateTotalFreezeAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal {
        erc3643Storage().frozenTokens[_tokenHolder] *= _factor;
        AdjustBalancesStorageWrapper.setTotalFreezeLabaf(_tokenHolder, _abaf);
    }

    function updateTotalFreezeAmountAndLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _factor,
        uint256 _abaf
    ) internal {
        erc3643Storage().frozenTokensByPartition[_tokenHolder][_partition] *= _factor;
        AdjustBalancesStorageWrapper.setTotalFreezeLabafByPartition(_partition, _tokenHolder, _abaf);
    }

    function recoveryAddress(
        address _lostWallet,
        address _newWallet,
        address _investorOnchainID,
        uint256 _timestamp
    ) internal returns (bool) {
        uint256 frozenBalance = getFrozenAmountForAdjustedAt(_lostWallet, _timestamp);
        if (frozenBalance > 0) {
            unfreezeTokens(_lostWallet, frozenBalance, _timestamp);
        }
        uint256 balance = ERC1410StorageWrapper.balanceOfAdjustedAt(_lostWallet, _timestamp);
        if (balance + frozenBalance > 0) {
            ERC20StorageWrapper.transfer(_lostWallet, _newWallet, balance);
        }
        if (frozenBalance > 0) {
            freezeTokens(_newWallet, frozenBalance);
        }
        if (ControlListStorageWrapper.isInControlList(_lostWallet)) {
            ControlListStorageWrapper.addToControlList(_newWallet);
        }
        ERC3643Storage storage $ = erc3643Storage();
        $.addressRecovered[_lostWallet] = true;
        $.addressRecovered[_newWallet] = false;

        emit IERC3643Types.RecoverySuccess(_lostWallet, _newWallet, _investorOnchainID);
        return true;
    }

    function requireUnrecoveredAddress(address _account) internal view {
        if (isRecovered(_account)) revert IERC3643Types.WalletRecovered();
    }

    function requireEmptyWallet(address _tokenHolder) internal view {
        if (!canRecover(_tokenHolder)) revert IERC3643Types.CannotRecoverWallet();
    }

    function getFrozenAmountFor(address _userAddress) internal view returns (uint256) {
        return erc3643Storage().frozenTokens[_userAddress];
    }

    function getFrozenAmountForByPartition(bytes32 _partition, address _userAddress) internal view returns (uint256) {
        return erc3643Storage().frozenTokensByPartition[_userAddress][_partition];
    }

    function isRecovered(address _sender) internal view returns (bool) {
        return erc3643Storage().addressRecovered[_sender];
    }

    function version() internal view returns (string memory) {
        return
            string(
                abi.encodePacked(
                    // solhint-disable quotes
                    "{",
                    '"Resolver": "',
                    Strings.toHexString(uint160(address(ResolverProxyStorageWrapper.getBusinessLogicResolver())), 20),
                    '", ',
                    '"Config ID": "',
                    Strings.toHexString(uint256(ResolverProxyStorageWrapper.getResolverProxyConfigurationId()), 32),
                    '", ',
                    '"Version": "',
                    Strings.toString(ResolverProxyStorageWrapper.getResolverProxyVersion()),
                    '"',
                    "}"
                    // solhint-enable quotes
                )
            );
    }

    function getCompliance() internal view returns (ICompliance) {
        return ICompliance(erc3643Storage().compliance);
    }

    function getIdentityRegistry() internal view returns (IIdentityRegistry) {
        return IIdentityRegistry(erc3643Storage().identityRegistry);
    }

    function getOnchainID() internal view returns (address) {
        return erc3643Storage().onchainID;
    }

    function isERC3643Initialized() internal view returns (bool) {
        return erc3643Storage().initialized;
    }

    function getFrozenAmountForAdjustedAt(address _tokenHolder, uint256 _timestamp) internal view returns (uint256) {
        return
            getFrozenAmountFor(_tokenHolder) *
            AdjustBalancesStorageWrapper.calculateFactorForFrozenAmountByTokenHolderAdjustedAt(
                _tokenHolder,
                _timestamp
            );
    }

    function getFrozenAmountForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256) {
        return
            getFrozenAmountForByPartition(_partition, _tokenHolder) *
            AdjustBalancesStorageWrapper.calculateFactor(
                AdjustBalancesStorageWrapper.getAbafAdjustedAt(_timestamp),
                AdjustBalancesStorageWrapper.getTotalFrozenLabafByPartition(_partition, _tokenHolder)
            );
    }

    function getTotalBalanceForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256) {
        return
            TokenCoreOps.getTotalBalanceForByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp) +
            getFrozenAmountForByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp);
    }

    function getTotalBalanceForAdjustedAt(address _tokenHolder, uint256 _timestamp) internal view returns (uint256) {
        return
            TokenCoreOps.getTotalBalanceForAdjustedAt(_tokenHolder, _timestamp) +
            getFrozenAmountForAdjustedAt(_tokenHolder, _timestamp);
    }

    function canRecover(address _tokenHolder) internal view returns (bool isEmpty_) {
        isEmpty_ =
            LockStorageWrapper.getLockedAmountFor(_tokenHolder) +
                HoldStorageWrapper.getHeldAmountFor(_tokenHolder) +
                ClearingStorageWrapper.getClearedAmountFor(_tokenHolder) ==
            0;
    }

    function erc3643Storage() internal pure returns (ERC3643Storage storage erc3643Storage_) {
        bytes32 position = _ERC3643_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc3643Storage_.slot := position
        }
    }

    function requireValidInputAmountsArrayLength(address[] memory _addresses, uint256[] memory _amounts) internal pure {
        if (_addresses.length != _amounts.length) {
            revert IERC3643Types.InputAmountsArrayLengthMismatch();
        }
    }

    function requireValidInputBoolArrayLength(address[] memory _addresses, bool[] memory _status) internal pure {
        if (_addresses.length != _status.length) {
            revert IERC3643Types.InputBoolArrayLengthMismatch();
        }
    }

    function _checkUnfreezeAmount(
        bytes32 _partition,
        address _userAddress,
        uint256 _amount,
        uint256 _timestamp
    ) private view {
        uint256 frozenAmount = getFrozenAmountForByPartitionAdjustedAt(_partition, _userAddress, _timestamp);
        if (frozenAmount < _amount) {
            revert IERC3643Types.InsufficientFrozenBalance(_userAddress, _amount, frozenAmount, _partition);
        }
    }
}
