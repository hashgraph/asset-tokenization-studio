// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC3643_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { _AGENT_ROLE } from "../../constants/roles.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { IERC3643Types } from "../../facets/layer_1/ERC3643/IERC3643Types.sol";
import { IAccessControl } from "../../facets/layer_1/accessControl/IAccessControl.sol";
import { LowLevelCall } from "../../infrastructure/utils/LowLevelCall.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
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
import { IERC20 } from "../../facets/layer_1/ERC1400/ERC20/IERC20.sol";

/**
 * @title  ERC3643StorageWrapper
 * @notice Internal library providing storage operations for the ERC3643 security token
 *         standard, including compliance and identity registry management, agent role
 *         administration, token freezing, address recovery, and multi-partition frozen
 *         balance tracking.
 * @dev    Anchors `ERC3643Storage` at `_ERC3643_STORAGE_POSITION` following the
 *         ERC-2535 Diamond Storage Pattern. All functions are `internal` and intended
 *         exclusively for use within facets or other internal libraries of the same
 *         diamond.
 *
 *         Frozen token balances are moved out of the holder's spendable partition balance
 *         at the time of freezing and restored on unfreeze. Both aggregate (`frozenTokens`)
 *         and per-partition (`frozenTokensByPartition`) accumulators are maintained in
 *         parallel; callers must keep these consistent. Both are subject to ABAF scaling
 *         via dedicated LABAF tracking (`TotalFrozenLabaf` and
 *         `TotalFrozenLabafByPartition`).
 *
 *         Address recovery transfers spendable and frozen balances from the lost wallet
 *         to the replacement wallet and marks the lost wallet as recovered; the recovered
 *         flag is permanent for the lost address. The replacement wallet's recovered flag
 *         is explicitly cleared to allow it to be used immediately.
 *
 *         The `version` function encodes the resolver address, configuration ID, and
 *         proxy version as a JSON-like string, sourced from `ResolverProxyStorageWrapper`.
 * @author Hashgraph
 */
library ERC3643StorageWrapper {
    using LowLevelCall for address;
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    /**
     * @notice Diamond Storage struct for ERC3643 security token state.
     * @dev    Stored at `_ERC3643_STORAGE_POSITION`. `frozenTokens` and
     *         `frozenTokensByPartition` track tokens removed from spendable balances;
     *         their sum across all partitions for a given holder must equal
     *         `frozenTokens[holder]`. The `addressRecovered` flag is set permanently
     *         for a lost wallet and explicitly cleared for the replacement on recovery.
     * @param onchainID                   Address of the token's on-chain identity
     *                                    contract.
     * @param identityRegistry            Address of the ERC3643 identity registry.
     * @param compliance                  Address of the ERC3643 compliance module.
     * @param frozenTokens                Maps a token holder to the aggregate quantity
     *                                    of their frozen tokens across all partitions.
     * @param frozenTokensByPartition     Maps a token holder and partition to the
     *                                    quantity of frozen tokens in that partition.
     * @param addressRecovered            Maps an address to its wallet-recovery status;
     *                                    `true` indicates the address has been superseded.
     * @param initialized                 True once `initialize_ERC3643` has been called.
     */
    struct ERC3643Storage {
        address onchainID;
        address identityRegistry;
        address compliance;
        mapping(address => uint256) frozenTokens;
        mapping(address => mapping(bytes32 => uint256)) frozenTokensByPartition;
        mapping(address => bool) addressRecovered;
        bool initialized;
    }

    /**
     * @notice Initialises the ERC3643 subsystem with the compliance module and identity
     *         registry addresses, then marks storage as initialised.
     * @dev    Must be called exactly once during diamond deployment. Calling this again
     *         overwrites `compliance` and `identityRegistry` and re-sets `initialized`;
     *         callers must enforce single-initialisation at the facet level.
     *         Emits: `IERC3643Types.ComplianceAdded`, `IERC3643Types.IdentityRegistryAdded`.
     * @param _compliance         Address of the ERC3643 compliance contract.
     * @param _identityRegistry   Address of the ERC3643 identity registry contract.
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC3643(address _compliance, address _identityRegistry) internal {
        erc3643Storage().initialized = true;
        setCompliance(_compliance);
        setIdentityRegistry(_identityRegistry);
    }

    /**
     * @notice Updates the frozen (address-level) status of an account by modifying its
     *         control list membership according to the active list type.
     * @dev    In whitelist mode (`getControlListType() == true`), freezing removes the
     *         address from the list (revoking access) and unfreezing adds it back. In
     *         blacklist mode the logic is inverted. This function does not touch the
     *         token balance; it solely governs access-control list membership.
     * @param _userAddress    Address whose freeze status is to be updated.
     * @param _freezeStatus   True to freeze (deny access); false to unfreeze (restore
     *                        access).
     */
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

    /**
     * @notice Grants the agent role to the specified address.
     * @dev    Delegates to `AccessControlStorageWrapper.grantRole`. Reverts with
     *         `IAccessControl.AccountAssignedToRole` if the address already holds
     *         `_AGENT_ROLE`, preventing silent no-ops on duplicate grants.
     * @param _agent  Address to be granted the agent role.
     */
    function addAgent(address _agent) internal {
        if (!AccessControlStorageWrapper.grantRole(_AGENT_ROLE, _agent)) {
            revert IAccessControl.AccountAssignedToRole(_AGENT_ROLE, _agent);
        }
    }

    /**
     * @notice Revokes the agent role from the specified address.
     * @dev    Delegates to `AccessControlStorageWrapper.revokeRole`. Reverts with
     *         `IAccessControl.AccountNotAssignedToRole` if the address does not currently
     *         hold `_AGENT_ROLE`, preventing silent no-ops on spurious revocations.
     * @param _agent  Address whose agent role is to be revoked.
     */
    function removeAgent(address _agent) internal {
        if (!AccessControlStorageWrapper.revokeRole(_AGENT_ROLE, _agent)) {
            revert IAccessControl.AccountNotAssignedToRole(_AGENT_ROLE, _agent);
        }
    }

    /**
     * @notice Replaces the stored compliance contract address and emits
     *         `IERC3643Types.ComplianceAdded`.
     * @dev    Overwrites the existing value without validation. Callers are responsible
     *         for ensuring `_compliance` is a valid, deployed compliance contract.
     *         Emits: `IERC3643Types.ComplianceAdded`.
     * @param _compliance  Address of the new ERC3643 compliance contract.
     */
    function setCompliance(address _compliance) internal {
        erc3643Storage().compliance = _compliance;
        emit IERC3643Types.ComplianceAdded(_compliance);
    }

    /**
     * @notice Replaces the stored identity registry address and emits
     *         `IERC3643Types.IdentityRegistryAdded`.
     * @dev    Overwrites the existing value without validation. Callers are responsible
     *         for ensuring `_identityRegistry` is a valid, deployed identity registry.
     *         Emits: `IERC3643Types.IdentityRegistryAdded`.
     * @param _identityRegistry  Address of the new ERC3643 identity registry contract.
     */
    function setIdentityRegistry(address _identityRegistry) internal {
        erc3643Storage().identityRegistry = _identityRegistry;
        emit IERC3643Types.IdentityRegistryAdded(_identityRegistry);
    }

    /**
     * @notice Updates the token name and emits `IERC3643Types.UpdatedTokenInformation`
     *         with the current full metadata snapshot.
     * @dev    Delegates the name write to `ERC20StorageWrapper.setName`. The emitted
     *         event includes the updated name alongside the unchanged symbol, decimals,
     *         version string, and on-chain identity address.
     *         Emits: `IERC3643Types.UpdatedTokenInformation`.
     * @param _name  New token name to store.
     */
    function setName(string calldata _name) internal {
        ERC20StorageWrapper.setName(_name);
        emit IERC3643Types.UpdatedTokenInformation(
            ERC20StorageWrapper.getName(),
            ERC20StorageWrapper.symbol(),
            ERC20StorageWrapper.decimals(),
            version(),
            erc3643Storage().onchainID
        );
    }

    /**
     * @notice Updates the token symbol and emits `IERC3643Types.UpdatedTokenInformation`
     *         with the current full metadata snapshot.
     * @dev    Delegates the symbol write to `ERC20StorageWrapper.setSymbol`. The emitted
     *         event includes the updated symbol alongside the unchanged name, decimals,
     *         version string, and on-chain identity address.
     *         Emits: `IERC3643Types.UpdatedTokenInformation`.
     * @param _symbol  New token symbol to store.
     */
    function setSymbol(string calldata _symbol) internal {
        ERC20StorageWrapper.setSymbol(_symbol);
        emit IERC3643Types.UpdatedTokenInformation(
            ERC20StorageWrapper.getName(),
            ERC20StorageWrapper.symbol(),
            ERC20StorageWrapper.decimals(),
            version(),
            erc3643Storage().onchainID
        );
    }

    /**
     * @notice Updates the on-chain identity address and emits
     *         `IERC3643Types.UpdatedTokenInformation` with the current full metadata
     *         snapshot.
     * @dev    Overwrites `ERC3643Storage.onchainID` directly. The emitted event reflects
     *         the new on-chain identity alongside the unchanged name, symbol, decimals,
     *         and version string.
     *         Emits: `IERC3643Types.UpdatedTokenInformation`.
     * @param _onchainID  New on-chain identity contract address.
     */
    function setOnchainID(address _onchainID) internal {
        erc3643Storage().onchainID = _onchainID;
        emit IERC3643Types.UpdatedTokenInformation(
            ERC20StorageWrapper.getName(),
            ERC20StorageWrapper.symbol(),
            ERC20StorageWrapper.decimals(),
            version(),
            _onchainID
        );
    }

    /**
     * @notice Freezes `_amount` tokens for `_account` under the default partition,
     *         moving them from the spendable balance to the frozen balance.
     * @dev    Convenience wrapper over `freezeTokensByPartition` using
     *         `_DEFAULT_PARTITION`. All preconditions and side effects of that function
     *         apply. Callers must ensure `_account` holds sufficient partition balance.
     * @param _account  Address whose tokens are to be frozen.
     * @param _amount   Token quantity to freeze.
     */
    function freezeTokens(address _account, uint256 _amount) internal {
        freezeTokensByPartition(_DEFAULT_PARTITION, _account, _amount);
    }

    /**
     * @notice Unfreezes `_amount` tokens for `_account` under the default partition,
     *         restoring them to the spendable balance after validating sufficient frozen
     *         balance at `_timestamp`.
     * @dev    Validates the unfreeze amount against the ABAF-adjusted frozen balance at
     *         `_timestamp` via `_checkUnfreezeAmount` before delegating to
     *         `unfreezeTokensByPartition`. Reverts with
     *         `IERC3643Types.InsufficientFrozenBalance` if the adjusted frozen balance
     *         is less than `_amount`.
     *         Emits: `IERC20.Transfer` from `address(0)` (via `unfreezeTokensByPartition`).
     * @param _account    Address whose tokens are to be unfrozen.
     * @param _amount     Token quantity to unfreeze.
     * @param _timestamp  Timestamp used to evaluate the ABAF-adjusted frozen balance for
     *                    the sufficiency check.
     */
    function unfreezeTokens(address _account, uint256 _amount, uint256 _timestamp) internal {
        _checkUnfreezeAmount(_DEFAULT_PARTITION, _account, _amount, _timestamp);
        unfreezeTokensByPartition(_DEFAULT_PARTITION, _account, _amount);
    }

    /**
     * @notice Freezes `_amount` tokens for `_account` under the specified partition,
     *         moving them from the spendable partition balance to the frozen accumulators.
     * @dev    Execution order:
     *           1. Triggers pending scheduled tasks and syncs balance adjustments via
     *              `ERC1410StorageWrapper.triggerAndSyncAll`.
     *           2. Syncs frozen ABAF via `updateTotalFreeze`.
     *           3. Updates account and frozen balance snapshots.
     *           4. Increments both `frozenTokens` and `frozenTokensByPartition`.
     *           5. Reduces the spendable partition balance via
     *              `ERC1410StorageWrapper.reduceBalanceByPartition`.
     *         Reverts with `IERC20.InsufficientBalance` if the partition balance is
     *         insufficient. No event is emitted by this function directly; callers are
     *         responsible for any required freeze event.
     * @param _partition  Partition from which tokens are frozen.
     * @param _account    Address whose tokens are to be frozen.
     * @param _amount     Token quantity to freeze.
     */
    function freezeTokensByPartition(bytes32 _partition, address _account, uint256 _amount) internal {
        ERC1410StorageWrapper.triggerAndSyncAll(_partition, _account, address(0));
        updateTotalFreeze(_partition, _account);
        SnapshotsStorageWrapper.updateAccountSnapshot(_account, _partition);
        SnapshotsStorageWrapper.updateAccountFrozenBalancesSnapshot(_account, _partition);
        ERC3643Storage storage st = erc3643Storage();
        st.frozenTokens[_account] += _amount;
        st.frozenTokensByPartition[_account][_partition] += _amount;
        ERC1410StorageWrapper.reduceBalanceByPartition(_account, _amount, _partition);
    }

    /**
     * @notice Unfreezes `_amount` tokens for `_account` under the specified partition,
     *         restoring them to the spendable balance.
     * @dev    Execution order:
     *           1. Triggers pending scheduled tasks and syncs balance adjustments.
     *           2. Syncs frozen ABAF via `updateTotalFreeze`.
     *           3. Updates account and frozen balance snapshots.
     *           4. Decrements both `frozenTokens` and `frozenTokensByPartition`.
     *           5. Restores the balance via `transferFrozenBalance`.
     *         Callers must validate the frozen balance is sufficient before calling;
     *         arithmetic underflow is not guarded here. Use `_checkUnfreezeAmount` or
     *         `getFrozenAmountForByPartitionAdjustedAt` to perform the check upstream.
     *         Emits: `IERC20.Transfer` from `address(0)` to `_account`.
     * @param _partition  Partition to which tokens are restored.
     * @param _account    Address whose tokens are to be unfrozen.
     * @param _amount     Token quantity to unfreeze.
     */
    function unfreezeTokensByPartition(bytes32 _partition, address _account, uint256 _amount) internal {
        ERC1410StorageWrapper.triggerAndSyncAll(_partition, _account, address(0));
        updateTotalFreeze(_partition, _account);
        SnapshotsStorageWrapper.updateAccountSnapshot(_account, _partition);
        SnapshotsStorageWrapper.updateAccountFrozenBalancesSnapshot(_account, _partition);
        ERC3643Storage storage st = erc3643Storage();
        st.frozenTokens[_account] -= _amount;
        st.frozenTokensByPartition[_account][_partition] -= _amount;
        transferFrozenBalance(_partition, _account, _amount);
        emit IERC20.Transfer(address(0), _account, _amount);
    }

    /**
     * @notice Restores a previously frozen token balance to a recipient's spendable
     *         partition balance, creating the partition entry if it does not yet exist.
     * @dev    If the recipient already holds a position in `_partition`, increments the
     *         existing balance via `increaseBalanceByPartition`. Otherwise creates a new
     *         partition entry via `addPartitionTo`. Must only be called after the frozen
     *         accumulators have already been decremented.
     * @param _partition  Partition to which the balance is restored.
     * @param _to         Recipient address.
     * @param _amount     Token quantity to restore.
     */
    function transferFrozenBalance(bytes32 _partition, address _to, uint256 _amount) internal {
        if (ERC1410StorageWrapper.validPartitionForReceiver(_partition, _to)) {
            ERC1410StorageWrapper.increaseBalanceByPartition(_to, _amount, _partition);
            return;
        }
        ERC1410StorageWrapper.addPartitionTo(_amount, _to, _partition);
    }

    /**
     * @notice Synchronises the aggregate and per-partition frozen ABAF for a token
     *         holder, scaling the stored frozen amounts by any outstanding adjustment
     *         factor, and returns the current ABAF.
     * @dev    Reads the current ABAF and compares it against both the aggregate frozen
     *         LABAF and the partition-specific frozen LABAF. If either diverges, the
     *         corresponding frozen accumulator is multiplied by the calculated factor
     *         and the LABAF is updated. Must be called before any frozen balance
     *         mutation to ensure the stored amounts reflect the current adjustment state.
     * @param _partition    Partition whose frozen LABAF is to be synchronised.
     * @param _tokenHolder  Account whose frozen balances are to be adjusted.
     * @return abaf_  Current global ABAF value at the time of the call.
     */
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

    /**
     * @notice Scales the aggregate frozen token amount for a holder by `_factor` and
     *         updates the stored aggregate frozen LABAF to `_abaf`.
     * @dev    Intended to be called only from `updateTotalFreeze` after confirming that
     *         the current ABAF diverges from the stored LABAF. Callers must ensure
     *         `_factor` is non-zero.
     * @param _tokenHolder  Account whose aggregate frozen amount is scaled.
     * @param _factor       Multiplicative scaling factor derived from `(abaf, labaf)`.
     * @param _abaf         Current ABAF value to store as the updated LABAF.
     */
    function updateTotalFreezeAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal {
        erc3643Storage().frozenTokens[_tokenHolder] *= _factor;
        AdjustBalancesStorageWrapper.setTotalFreezeLabaf(_tokenHolder, _abaf);
    }

    /**
     * @notice Scales the per-partition frozen token amount for a holder by `_factor`
     *         and updates the stored partition-specific frozen LABAF to `_abaf`.
     * @dev    Intended to be called only from `updateTotalFreeze` after confirming that
     *         the current ABAF diverges from the stored partition LABAF. Callers must
     *         ensure `_factor` is non-zero.
     * @param _partition    Partition whose frozen amount is scaled.
     * @param _tokenHolder  Account whose partition frozen amount is scaled.
     * @param _factor       Multiplicative scaling factor derived from `(abaf, labafByPartition)`.
     * @param _abaf         Current ABAF value to store as the updated partition LABAF.
     */
    function updateTotalFreezeAmountAndLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _factor,
        uint256 _abaf
    ) internal {
        erc3643Storage().frozenTokensByPartition[_tokenHolder][_partition] *= _factor;
        AdjustBalancesStorageWrapper.setTotalFreezeLabafByPartition(_partition, _tokenHolder, _abaf);
    }

    /**
     * @notice Executes a full wallet recovery, transferring the lost wallet's spendable
     *         and frozen balances to the replacement wallet, replicating control list
     *         membership, and marking the lost address as permanently recovered.
     * @dev    Execution order:
     *           1. If frozen balance > 0, unfreezes all frozen tokens from the lost
     *              wallet using `_timestamp` for the sufficiency check.
     *           2. If total transferable balance > 0, transfers the spendable balance
     *              from `_lostWallet` to `_newWallet` via `ERC20StorageWrapper.transfer`.
     *           3. If there was a frozen balance, re-freezes the same amount on
     *              `_newWallet`.
     *           4. If the lost wallet is in the control list, adds the new wallet too.
     *           5. Sets `addressRecovered[_lostWallet] = true` and
     *              `addressRecovered[_newWallet] = false` to allow immediate use of the
     *              replacement.
     *         Callers must invoke `requireEmptyWallet` first to ensure no active locks,
     *         holds, or clearing operations exist on `_lostWallet`.
     *         Emits: `IERC3643Types.RecoverySuccess`.
     * @param _lostWallet          Address being superseded by recovery.
     * @param _newWallet           Replacement address to receive all balances.
     * @param _investorOnchainID   Investor's on-chain identity address, included in the
     *                             emitted event.
     * @param _timestamp           Timestamp used for ABAF-adjusted balance calculations
     *                             during the recovery process.
     * @return True on successful completion.
     */
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

    /**
     * @notice Reverts if the given address has been marked as recovered.
     * @dev    Reverts with `IERC3643Types.WalletRecovered`. Use as a guard at the entry
     *         point of any operation that must not execute against a superseded wallet.
     * @param _account  Address to check.
     */
    function requireUnrecoveredAddress(address _account) internal view {
        if (isRecovered(_account)) revert IERC3643Types.WalletRecovered();
    }

    /**
     * @notice Reverts if the given address has any active locks, holds, or clearing
     *         operations that would prevent safe wallet recovery.
     * @dev    Delegates to `canRecover`. Reverts with
     *         `IERC3643Types.CannotRecoverWallet` if the wallet is not empty. Must be
     *         called before `recoveryAddress` to ensure a clean state transfer.
     * @param _tokenHolder  Address to check for active encumbrances.
     */
    function requireEmptyWallet(address _tokenHolder) internal view {
        if (!canRecover(_tokenHolder)) revert IERC3643Types.CannotRecoverWallet();
    }

    /**
     * @notice Returns the raw aggregate frozen token amount for an address, without
     *         ABAF adjustment.
     * @dev    Reads directly from `ERC3643Storage.frozenTokens`. The returned value may
     *         not reflect the current effective frozen amount if ABAF has changed since
     *         the last `updateTotalFreeze` call. Use `getFrozenAmountForAdjustedAt` for
     *         an adjustment-aware view.
     * @param _userAddress  Address to query.
     * @return Raw aggregate frozen token quantity.
     */
    function getFrozenAmountFor(address _userAddress) internal view returns (uint256) {
        return erc3643Storage().frozenTokens[_userAddress];
    }

    /**
     * @notice Returns the raw frozen token amount for an address under a specific
     *         partition, without ABAF adjustment.
     * @dev    Reads directly from `ERC3643Storage.frozenTokensByPartition`. Use
     *         `getFrozenAmountForByPartitionAdjustedAt` for an adjustment-aware view.
     * @param _partition    Partition to query.
     * @param _userAddress  Address to query.
     * @return Raw frozen token quantity for the specified partition.
     */
    function getFrozenAmountForByPartition(bytes32 _partition, address _userAddress) internal view returns (uint256) {
        return erc3643Storage().frozenTokensByPartition[_userAddress][_partition];
    }

    /**
     * @notice Returns whether the given address has been permanently marked as recovered.
     * @dev    A `true` return means the address has been superseded by a recovery
     *         operation and must not be used for active token operations.
     * @param _sender  Address to check.
     * @return True if the address has been recovered; false otherwise.
     */
    function isRecovered(address _sender) internal view returns (bool) {
        return erc3643Storage().addressRecovered[_sender];
    }

    /**
     * @notice Returns a JSON-like version string encoding the resolver address,
     *         configuration ID, and proxy version for this token deployment.
     * @dev    Constructs the string by concatenating hex-encoded values from
     *         `ResolverProxyStorageWrapper`. The format is:
     *         `{"Resolver": "0x...", "Config ID": "0x...", "Version": "0x..."}`.
     *         Gas cost scales with the string construction; avoid calling in tight loops.
     * @return JSON-like version string for the current proxy configuration.
     */
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
                    Strings.toHexString(uint256(ResolverProxyStorageWrapper.getResolverProxyVersion()), 32),
                    '"',
                    "}"
                    // solhint-enable quotes
                )
            );
    }

    /**
     * @notice Returns the stored compliance contract address.
     * @dev    Returns `address(0)` if the compliance module has not been set.
     * @return Address of the ERC3643 compliance contract.
     */
    function getCompliance() internal view returns (address) {
        return erc3643Storage().compliance;
    }

    /**
     * @notice Returns the stored identity registry contract address.
     * @dev    Returns `address(0)` if the identity registry has not been set.
     * @return Address of the ERC3643 identity registry contract.
     */
    function getIdentityRegistry() internal view returns (address) {
        return erc3643Storage().identityRegistry;
    }

    /**
     * @notice Returns the stored on-chain identity address for this token.
     * @dev    Returns `address(0)` if the on-chain identity has not been set.
     * @return Address of the token's on-chain identity contract.
     */
    function getOnchainID() internal view returns (address) {
        return erc3643Storage().onchainID;
    }

    /**
     * @notice Returns whether the ERC3643 subsystem has been initialised.
     * @dev    Returns `false` until `initialize_ERC3643` has been called. A `false`
     *         return indicates that compliance and identity registry addresses are
     *         uninitialised.
     * @return True if `initialize_ERC3643` has been called at least once; false otherwise.
     */
    function isERC3643Initialized() internal view returns (bool) {
        return erc3643Storage().initialized;
    }

    /**
     * @notice Returns the aggregate frozen token amount for a holder scaled by the
     *         ABAF ratio at the given timestamp.
     * @dev    Multiplies the raw frozen amount by the factor derived from
     *         `calculateFactorForFrozenAmountByTokenHolderAdjustedAt`. This provides a
     *         read-only projection; no state is mutated. Use when evaluating frozen
     *         balance sufficiency at a specific point in time.
     * @param _tokenHolder  Address to query.
     * @param _timestamp    Unix timestamp at which to evaluate the ABAF adjustment.
     * @return ABAF-adjusted aggregate frozen token amount for `_tokenHolder`.
     */
    function getFrozenAmountForAdjustedAt(address _tokenHolder, uint256 _timestamp) internal view returns (uint256) {
        return
            getFrozenAmountFor(_tokenHolder) *
            AdjustBalancesStorageWrapper.calculateFactorForFrozenAmountByTokenHolderAdjustedAt(
                _tokenHolder,
                _timestamp
            );
    }

    /**
     * @notice Returns the per-partition frozen token amount for a holder scaled by the
     *         ABAF ratio at the given timestamp.
     * @dev    Multiplies the raw partition frozen amount by
     *         `calculateFactor(abafAt(timestamp), labafByPartitionFrozen)`. This is a
     *         read-only projection; no state is mutated.
     * @param _partition    Partition to query.
     * @param _tokenHolder  Address to query.
     * @param _timestamp    Unix timestamp at which to evaluate the ABAF adjustment.
     * @return ABAF-adjusted frozen token amount for `_tokenHolder` in `_partition`.
     */
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

    /**
     * @notice Returns the total token balance (spendable plus frozen) for a holder under
     *         a specific partition, both adjusted at the given timestamp.
     * @dev    Sums the result of `TokenCoreOps.getTotalBalanceForByPartitionAdjustedAt`
     *         (spendable) and `getFrozenAmountForByPartitionAdjustedAt` (frozen). This is
     *         a read-only projection used for compliance and snapshot purposes.
     * @param _partition    Partition to query.
     * @param _tokenHolder  Address to query.
     * @param _timestamp    Unix timestamp at which to evaluate both balance components.
     * @return Combined spendable and frozen balance for `_tokenHolder` in `_partition`
     *         at `_timestamp`.
     */
    function getTotalBalanceForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256) {
        return
            TokenCoreOps.getTotalBalanceForByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp) +
            getFrozenAmountForByPartitionAdjustedAt(_partition, _tokenHolder, _timestamp);
    }

    /**
     * @notice Returns the total token balance (spendable plus frozen) for a holder
     *         across the default partition, both adjusted at the given timestamp.
     * @dev    Sums the result of `TokenCoreOps.getTotalBalanceForAdjustedAt` (spendable)
     *         and `getFrozenAmountForAdjustedAt` (frozen). This is a read-only projection
     *         used for compliance and snapshot purposes.
     * @param _tokenHolder  Address to query.
     * @param _timestamp    Unix timestamp at which to evaluate both balance components.
     * @return Combined spendable and frozen balance for `_tokenHolder` at `_timestamp`.
     */
    function getTotalBalanceForAdjustedAt(address _tokenHolder, uint256 _timestamp) internal view returns (uint256) {
        return
            TokenCoreOps.getTotalBalanceForAdjustedAt(_tokenHolder, _timestamp) +
            getFrozenAmountForAdjustedAt(_tokenHolder, _timestamp);
    }

    /**
     * @notice Returns whether a token holder's wallet is free of active locks, holds,
     *         and clearing operations, indicating that wallet recovery is safe to
     *         proceed.
     * @dev    Sums the locked, held, and cleared amounts for the holder across all
     *         relevant storage wrappers. A sum of zero indicates no active encumbrances.
     *         Does not account for frozen tokens, as those are transferred during
     *         recovery rather than blocking it.
     * @param _tokenHolder  Address to check.
     * @return isEmpty_  True if the holder has no active locks, holds, or clearing
     *                   operations; false otherwise.
     */
    function canRecover(address _tokenHolder) internal view returns (bool isEmpty_) {
        isEmpty_ =
            LockStorageWrapper.getLockedAmountFor(_tokenHolder) +
                HoldStorageWrapper.getHeldAmountFor(_tokenHolder) +
                ClearingStorageWrapper.getClearedAmountFor(_tokenHolder) ==
            0;
    }

    /**
     * @notice Reverts if the `_addresses` and `_amounts` arrays have different lengths.
     * @dev    Intended as a parameter validation guard for batch operations that pair
     *         addresses with token amounts. Reverts with
     *         `IERC3643Types.InputAmountsArrayLengthMismatch`.
     * @param _addresses  Array of token holder addresses.
     * @param _amounts    Array of token amounts corresponding to each address.
     */
    function requireValidInputAmountsArrayLength(address[] memory _addresses, uint256[] memory _amounts) internal pure {
        if (_addresses.length != _amounts.length) {
            revert IERC3643Types.InputAmountsArrayLengthMismatch();
        }
    }

    /**
     * @notice Reverts if the `_addresses` and `_status` arrays have different lengths.
     * @dev    Intended as a parameter validation guard for batch operations that pair
     *         addresses with boolean flags. Reverts with
     *         `IERC3643Types.InputBoolArrayLengthMismatch`.
     * @param _addresses  Array of token holder addresses.
     * @param _status     Array of boolean status flags corresponding to each address.
     */
    function requireValidInputBoolArrayLength(address[] memory _addresses, bool[] memory _status) internal pure {
        if (_addresses.length != _status.length) {
            revert IERC3643Types.InputBoolArrayLengthMismatch();
        }
    }

    /**
     * @notice Reverts if the ABAF-adjusted frozen balance for `_userAddress` under
     *         `_partition` at `_timestamp` is less than `_amount`.
     * @dev    Reverts with `IERC3643Types.InsufficientFrozenBalance` on failure,
     *         encoding the address, requested amount, current adjusted frozen balance,
     *         and partition as context. Called as a pre-condition by `unfreezeTokens`
     *         before any state mutation occurs.
     * @param _partition    Partition whose frozen balance is evaluated.
     * @param _userAddress  Address whose frozen balance is checked.
     * @param _amount       Token quantity that must be available to unfreeze.
     * @param _timestamp    Timestamp used to evaluate the ABAF-adjusted frozen balance.
     */
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

    /**
     * @notice Returns the Diamond Storage pointer for `ERC3643Storage`.
     * @dev    Uses inline assembly to position the struct at the deterministic slot
     *         defined by `_ERC3643_STORAGE_POSITION`, following the ERC-2535 Diamond
     *         Storage Pattern. Slot isolation prevents collisions with other facet
     *         storage structs in the same proxy. Must only be called from within this
     *         library.
     * @return erc3643Storage_  Storage pointer to the `ERC3643Storage` struct.
     */
    function erc3643Storage() private pure returns (ERC3643Storage storage erc3643Storage_) {
        bytes32 position = _ERC3643_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc3643Storage_.slot := position
        }
    }
}
