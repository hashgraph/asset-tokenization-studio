// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ROLE_AGENT } from "../../constants/roles.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { IERC3643Types } from "../../facets/layer_1/ERC3643/IERC3643Types.sol";
import { IFreeze } from "../../facets/freeze/IFreeze.sol";
import { IAccessControl } from "../../facets/accessControl/IAccessControl.sol";
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

/// @custom:hash storage Erc3643
bytes32 constant STORAGE_LOCATION_ERC3643 = 0x167d628abbc681171e3e4d784cf450a7f9bb9f4668795474376d3b21d0ade300;

/**
 * @notice ERC-7201 namespaced storage for the ERC3643-compliant token capability.
 * @dev Holds the initialisation flag, the compliance / identity-registry / onchainID
 *      wiring, per-account frozen balances (global and per-partition), and the
 *      recovered-wallet marker. Reorganising fields above the APPEND-ONLY marker
 *      breaks deployed proxies; new fields land in the append-only zone.
 * @custom:storage-location erc7201:security.token.standard.storage.Erc3643
 */
struct ERC3643Storage {
    // ─── R1 Packed scalars (uint8, bytes3, address, enum) ────
    address onchainID;
    address identityRegistry;
    address compliance;
    // ─── R3 Aggregates (mapping, array, EnumerableSet) ───────
    mapping(address => uint256) frozenTokens;
    mapping(address => mapping(bytes32 => uint256)) frozenTokensByPartition;
    mapping(address => bool) addressRecovered;
    // ─── APPEND-ONLY ZONE BELOW ───
}

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

    /**
     * @notice Initialises the ERC3643 capability by wiring the compliance and identity-registry
     *         addresses and marking the namespace as initialised.
     * @dev Single-shot setup; subsequent calls should be guarded upstream by the initialiser
     *      modifier so the storage flag cannot be flipped twice.
     * @param _compliance Address of the compliance contract that authorises transfers.
     * @param _identityRegistry Address of the identity registry that vets token holders.
     */
    function initializeERC3643(address _compliance, address _identityRegistry) internal {
        setCompliance(_compliance);
        setIdentityRegistry(_identityRegistry);
    }

    /**
     * @notice Sets the freeze status of a wallet by toggling its presence on the control list.
     * @dev Branch dispatches on the control-list semantics (allow- versus block-list) so that
     *      the resulting state always represents "frozen" or "unfrozen" consistently regardless
     *      of the list polarity.
     * @param _userAddress Wallet whose freeze status is being mutated.
     * @param _freezeStatus `true` to freeze the wallet, `false` to unfreeze it.
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
     * @notice Grants the agent role to an account.
     * @dev Reverts with `IAccessControl.AccountAssignedToRole` if `_agent` already holds the
     *      role, surfacing the double-grant attempt to the caller.
     * @param _agent Address being elevated to agent.
     */
    function addAgent(address _agent) internal {
        if (!AccessControlStorageWrapper.grantRole(ROLE_AGENT, _agent)) {
            revert IAccessControl.AccountAssignedToRole(ROLE_AGENT, _agent);
        }
    }

    /**
     * @notice Revokes the agent role from an account.
     * @dev Reverts with `IAccessControl.AccountNotAssignedToRole` if `_agent` does not hold the
     *      role, preventing silent no-ops in administrative flows.
     * @param _agent Address whose agent role is being revoked.
     */
    function removeAgent(address _agent) internal {
        if (!AccessControlStorageWrapper.revokeRole(ROLE_AGENT, _agent)) {
            revert IAccessControl.AccountNotAssignedToRole(ROLE_AGENT, _agent);
        }
    }

    /**
     * @notice Replaces the compliance contract wired into the token.
     * @dev Emits `ComplianceAdded` so off-chain observers can rebuild the audit trail of which
     *      compliance contract was authoritative at any point in time.
     * @param _compliance New compliance contract address.
     */
    function setCompliance(address _compliance) internal {
        erc3643Storage().compliance = _compliance;
        emit IERC3643Types.ComplianceAdded(_compliance);
    }

    /**
     * @notice Replaces the identity registry wired into the token.
     * @dev Emits `IdentityRegistryAdded` so off-chain indexers can track which registry vetted
     *      holders at any historical block.
     * @param _identityRegistry New identity-registry address.
     */
    function setIdentityRegistry(address _identityRegistry) internal {
        erc3643Storage().identityRegistry = _identityRegistry;
        emit IERC3643Types.IdentityRegistryAdded(_identityRegistry);
    }

    /**
     * @notice Updates the token's display name and emits a refreshed token-information event.
     * @dev Delegates the actual write to `ERC20StorageWrapper`; the emission carries the complete
     *      information tuple (name, symbol, decimals, version, onchainID) so consumers do not
     *      need to perform multiple reads to reconstruct state.
     * @param _name New token name.
     */
    function setName(string calldata _name) internal {
        ERC20StorageWrapper.setName(_name);
        ERC20Storage storage erc20Storage_ = ERC20StorageWrapper.erc20Storage();
        emit IERC3643Types.UpdatedTokenInformation(
            erc20Storage_.name,
            erc20Storage_.symbol,
            erc20Storage_.decimals,
            version(),
            erc3643Storage().onchainID
        );
    }

    /**
     * @notice Updates the token's ticker symbol and emits a refreshed token-information event.
     * @dev See `setName` for the rationale behind emitting the full information tuple.
     * @param _symbol New token symbol.
     */
    function setSymbol(string calldata _symbol) internal {
        ERC20StorageWrapper.setSymbol(_symbol);
        ERC20Storage storage erc20Storage_ = ERC20StorageWrapper.erc20Storage();
        emit IERC3643Types.UpdatedTokenInformation(
            erc20Storage_.name,
            erc20Storage_.symbol,
            erc20Storage_.decimals,
            version(),
            erc3643Storage().onchainID
        );
    }

    /**
     * @notice Updates the OnchainID associated with this token.
     * @dev Emits `UpdatedTokenInformation` with the freshly-written onchainID so observers see
     *      the new value without having to read storage.
     * @param _onchainID New OnchainID address.
     */
    function setOnchainID(address _onchainID) internal {
        erc3643Storage().onchainID = _onchainID;
        ERC20Storage storage erc20Storage_ = ERC20StorageWrapper.erc20Storage();
        emit IERC3643Types.UpdatedTokenInformation(
            erc20Storage_.name,
            erc20Storage_.symbol,
            erc20Storage_.decimals,
            version(),
            _onchainID
        );
    }

    /**
     * @notice Freezes `_amount` of `_account`'s tokens on the default partition.
     * @dev Triggers any pending adjustments, refreshes account / frozen-balance snapshots, then
     *      increments both the global and per-partition frozen counters before reducing the
     *      default partition balance and emitting the ERC20 zero-address transfer that mirrors
     *      the freeze on the unified ledger. Zero-amount freezes revert via
     *      `checkNonZeroFreezeAmount`.
     * @param _account Holder whose tokens are being frozen.
     * @param _amount Quantity to freeze.
     */
    function freezeTokens(address _account, uint256 _amount) internal {
        checkNonZeroFreezeAmount(_amount);

        ERC1410StorageWrapper.triggerAndSyncAll(_DEFAULT_PARTITION, _account, address(0));
        updateTotalFreeze(_DEFAULT_PARTITION, _account);
        SnapshotsStorageWrapper.updateAccountSnapshot(_account, _DEFAULT_PARTITION);
        SnapshotsStorageWrapper.updateAccountFrozenBalancesSnapshot(_account, _DEFAULT_PARTITION);

        ERC3643Storage storage st = erc3643Storage();
        st.frozenTokens[_account] += _amount;
        st.frozenTokensByPartition[_account][_DEFAULT_PARTITION] += _amount;

        ERC1410StorageWrapper.reducePartitionOnly(_account, _amount, _DEFAULT_PARTITION);
        ERC20StorageWrapper.performTransfer(_account, address(0), _amount);
    }

    /**
     * @notice Unfreezes `_amount` of `_account`'s tokens on the default partition.
     * @dev Validates the frozen balance via `_checkUnfreezeAmount` before applying the unfreeze
     *      inline on the default partition. Refreshes account / frozen-balance snapshots,
     *      decrements both the global and per-partition frozen counters, restores the partition
     *      balance via `_transferFrozenBalanceOnly`, and emits the corresponding ERC20
     *      zero-address transfer plus the ERC1410 after-hook.
     * @param _account Holder whose tokens are being unfrozen.
     * @param _amount Quantity to unfreeze.
     * @param _timestamp Reference timestamp used for adjustment-factor calculation when sizing
     *        the frozen balance against historical adjustments.
     */
    function unfreezeTokens(address _account, uint256 _amount, uint256 _timestamp) internal {
        _checkUnfreezeAmount(_DEFAULT_PARTITION, _account, _amount, _timestamp);
        ERC1410StorageWrapper.triggerAndSyncAll(_DEFAULT_PARTITION, _account, address(0));
        updateTotalFreeze(_DEFAULT_PARTITION, _account);
        SnapshotsStorageWrapper.updateAccountSnapshot(_account, _DEFAULT_PARTITION);
        SnapshotsStorageWrapper.updateAccountFrozenBalancesSnapshot(_account, _DEFAULT_PARTITION);

        ERC3643Storage storage st = erc3643Storage();
        st.frozenTokens[_account] -= _amount;
        st.frozenTokensByPartition[_account][_DEFAULT_PARTITION] -= _amount;

        _transferFrozenBalanceOnly(_DEFAULT_PARTITION, _account, _amount);
        ERC20StorageWrapper.performTransfer(address(0), _account, _amount);
        ERC1410StorageWrapper.afterTokenTransfer(_DEFAULT_PARTITION, _account, _account, _amount);
    }

    /**
     * @notice Brings the holder's frozen totals up to date with the current adjust-balances factor.
     * @dev Compares the active ABAF (Adjust-Balance Adjustment Factor) against the last-applied
     *      values stored both globally and per-partition; when either diverges, scales the
     *      corresponding frozen balance and writes back the fresh LABAF. Exits cheaply when both
     *      LABAFs are already current.
     * @param _partition Partition whose per-partition frozen total may need adjustment.
     * @param _tokenHolder Holder whose frozen totals are being reconciled.
     * @return abaf_ The active ABAF at the moment of the call.
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
     * @notice Scales the holder's global frozen balance by `_factor` and stores the matching LABAF.
     * @dev Used by `updateTotalFreeze` to apply an aggregate balance adjustment in a single
     *      multiplication, avoiding per-event iteration.
     * @param _tokenHolder Holder whose global frozen balance is being scaled.
     * @param _factor Multiplicative factor derived from the current ABAF and the stored LABAF.
     * @param _abaf Active ABAF value to persist as the new LABAF.
     */
    function updateTotalFreezeAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal {
        erc3643Storage().frozenTokens[_tokenHolder] *= _factor;
        AdjustBalancesStorageWrapper.setTotalFreezeLabaf(_tokenHolder, _abaf);
    }

    /**
     * @notice Scales the holder's per-partition frozen balance by `_factor` and stores the
     *         matching per-partition LABAF.
     * @dev Per-partition counterpart of `updateTotalFreezeAmountAndLabaf`.
     * @param _partition Partition whose frozen balance is being scaled.
     * @param _tokenHolder Holder whose partition frozen balance is being scaled.
     * @param _factor Multiplicative factor derived from the current ABAF and the stored LABAF.
     * @param _abaf Active ABAF value to persist as the new per-partition LABAF.
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
     * @notice Moves a holder's balances from a lost wallet to a fresh one as part of the
     *         ERC3643 recovery flow.
     * @dev Workflow: unfreezes any frozen balance on the lost wallet, transfers the spendable
     *      and previously-frozen balances to `_newWallet`, re-freezes the same amount on the
     *      new wallet, mirrors the lost wallet's control-list presence onto the new wallet,
     *      flips the `addressRecovered` flag on both, and emits `RecoverySuccess`. All balance
     *      reads use the adjustment-factor-aware accessors so the recovery is consistent with
     *      the holder's historical position.
     * @param _lostWallet Wallet being abandoned.
     * @param _newWallet Wallet receiving the migrated balances.
     * @param _investorOnchainID OnchainID of the underlying investor, included in the emitted
     *        event for off-chain reconciliation.
     * @param _timestamp Reference timestamp for adjustment-factor calculations.
     * @return Always `true` on success; the function reverts otherwise.
     */
    function recoveryAddress(
        address _lostWallet,
        address _newWallet,
        address _investorOnchainID,
        uint256 _timestamp
    ) internal returns (bool) {
        ERC3643Storage storage $ = erc3643Storage();
        $.addressRecovered[_lostWallet] = true;
        $.addressRecovered[_newWallet] = false;

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

        emit IERC3643Types.RecoverySuccess(_lostWallet, _newWallet, _investorOnchainID);
        return true;
    }

    /**
     * @notice Reverts if `_account` has already been recovered.
     * @dev Used as a pre-condition guard on flows that must not target previously-abandoned
     *      wallets (e.g. mint/transfer entry points).
     * @param _account Wallet whose recovery status is being checked.
     */
    function requireUnrecoveredAddress(address _account) internal view {
        if (isRecovered(_account)) revert IERC3643Types.WalletRecovered();
    }

    /**
     * @notice Reverts unless the holder's lock/hold/clearing balances are all zero.
     * @dev Pre-condition for `recoveryAddress`: only wallets that no longer participate in any
     *      bound balance flow can be safely recovered.
     * @param _tokenHolder Holder whose balances are being inspected.
     */
    function requireEmptyWallet(address _tokenHolder) internal view {
        if (!canRecover(_tokenHolder)) revert IERC3643Types.CannotRecoverWallet();
    }

    /**
     * @notice Returns the holder's currently-frozen global balance.
     * @param _userAddress Holder whose frozen balance is being queried.
     * @return Frozen amount stored against `_userAddress`.
     */
    function getFrozenAmountFor(address _userAddress) internal view returns (uint256) {
        return erc3643Storage().frozenTokens[_userAddress];
    }

    /**
     * @notice Returns the freezing status of a wallet.
     * @dev returning true mean that some token or all of them are frozen
     * @param _userAddress The address of the wallet on which isFrozen is called.
     * @return The freezing status of a wallet.
     */
    function isFrozen(address _userAddress) internal view returns (bool) {
        return erc3643Storage().frozenTokens[_userAddress] > 0;
    }

    /**
     * @notice Returns the holder's currently-frozen balance on a specific partition.
     * @param _partition Partition being queried.
     * @param _userAddress Holder whose partition frozen balance is being read.
     * @return Frozen amount stored against the partition for `_userAddress`.
     */
    function getFrozenAmountForByPartition(bytes32 _partition, address _userAddress) internal view returns (uint256) {
        return erc3643Storage().frozenTokensByPartition[_userAddress][_partition];
    }

    /**
     * @notice Reports whether the supplied wallet has been recovered.
     * @param _sender Wallet whose recovery flag is being read.
     * @return `true` if the wallet has been recovered.
     */
    function isRecovered(address _sender) internal view returns (bool) {
        return erc3643Storage().addressRecovered[_sender];
    }

    /**
     * @notice Serialises the resolver-proxy version metadata as a JSON-formatted string.
     * @dev Returns a tuple of resolver address, configuration id (32-byte hex) and proxy
     *      version. Consumers (typically explorers and SDKs) parse this JSON to surface the
     *      diamond's current logic binding.
     * @return versionJson_ JSON-encoded version descriptor.
     */
    function version() internal view returns (string memory versionJson_) {
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

    /**
     * @notice Returns the active compliance contract typed as `ICompliance`.
     * @return Compliance contract wired into the token.
     */
    function getCompliance() internal view returns (ICompliance) {
        return ICompliance(erc3643Storage().compliance);
    }

    /**
     * @notice Returns the active identity registry typed as `IIdentityRegistry`.
     * @return Identity-registry contract wired into the token.
     */
    function getIdentityRegistry() internal view returns (IIdentityRegistry) {
        return IIdentityRegistry(erc3643Storage().identityRegistry);
    }

    /**
     * @notice Returns the OnchainID currently associated with this token.
     * @return Configured OnchainID address.
     */
    function getOnchainID() internal view returns (address) {
        return erc3643Storage().onchainID;
    }

    /**
     * @notice Returns the holder's frozen global balance adjusted to `_timestamp`.
     * @dev Applies the historical adjust-balance factor relevant to `_timestamp` to the
     *      currently-stored frozen total, so callers see the value as it would have stood at
     *      the supplied moment.
     * @param _tokenHolder Holder whose frozen balance is being queried.
     * @param _timestamp Reference timestamp for the adjustment factor.
     * @return Adjusted frozen amount at `_timestamp`.
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
     * @notice Returns the holder's frozen partition balance adjusted to `_timestamp`.
     * @dev Multiplies the current per-partition frozen balance by the factor computed from the
     *      ABAF at `_timestamp` and the partition's stored LABAF.
     * @param _partition Partition being queried.
     * @param _tokenHolder Holder whose partition frozen balance is being queried.
     * @param _timestamp Reference timestamp for the adjustment factor.
     * @return Adjusted partition frozen amount at `_timestamp`.
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
     * @notice Returns the holder's combined spendable plus frozen partition balance adjusted
     *         to `_timestamp`.
     * @dev Sums the orchestrator-side total balance with the frozen partition balance at the
     *      same timestamp, giving callers the holder's economic position regardless of freeze
     *      state.
     * @param _partition Partition being queried.
     * @param _tokenHolder Holder whose total balance is being queried.
     * @param _timestamp Reference timestamp for the adjustment factor.
     * @return Total partition balance (spendable + frozen) at `_timestamp`.
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
     * @notice Reports whether the holder's wallet is empty enough to be recovered.
     * @dev Recovery requires that the holder has zero locked, held and cleared balances across
     *      every partition; otherwise the post-recovery accounting would orphan in-flight
     *      operations on the lost wallet.
     * @param _tokenHolder Holder being inspected.
     * @return isEmpty_ `true` if every bound-balance category is zero.
     */
    function canRecover(address _tokenHolder) internal view returns (bool isEmpty_) {
        isEmpty_ =
            LockStorageWrapper.getLockedAmountFor(_tokenHolder) +
                HoldStorageWrapper.getHeldAmountFor(_tokenHolder) +
                ClearingStorageWrapper.getClearedAmountFor(_tokenHolder) ==
            0;
    }

    /**
     * @notice Returns a storage pointer to the ERC3643 namespace.
     * @dev Uses inline assembly to bind the returned reference to the deterministic ERC-7201
     *      slot `STORAGE_LOCATION_ERC3643`. Marked `pure` because Solidity treats slot literals
     *      as pure even though the returned reference reads/writes storage.
     * @return erc3643Storage_ Storage reference for the ERC3643 namespace.
     */
    function erc3643Storage() internal pure returns (ERC3643Storage storage erc3643Storage_) {
        bytes32 position = STORAGE_LOCATION_ERC3643;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc3643Storage_.slot := position
        }
    }

    /**
     * @notice Reverts unless the addresses and amounts arrays have the same length.
     * @dev Pre-condition guard for batch freeze/unfreeze entry points; raises
     *      `InputAmountsArrayLengthMismatch` to surface caller error explicitly.
     * @param _addresses Holders being targeted by the batch operation.
     * @param _amounts Amounts paired with each holder.
     */
    function requireValidInputAmountsArrayLength(address[] memory _addresses, uint256[] memory _amounts) internal pure {
        if (_addresses.length != _amounts.length) {
            revert IERC3643Types.InputAmountsArrayLengthMismatch();
        }
    }

    /**
     * @notice Reverts unless the addresses and status arrays have the same length.
     * @dev Pre-condition guard for batch freeze-status updates; raises
     *      `InputBoolArrayLengthMismatch` on mismatch.
     * @param _addresses Holders being targeted by the batch operation.
     * @param _status Freeze flags paired with each holder.
     */
    function requireValidInputBoolArrayLength(address[] memory _addresses, bool[] memory _status) internal pure {
        if (_addresses.length != _status.length) {
            revert IERC3643Types.InputBoolArrayLengthMismatch();
        }
    }

    /**
     * @notice Reverts when the supplied freeze amount is zero.
     * @dev Cheap sanity check called by `freezeTokens`; raises `IFreeze.InvalidFreezeAmount`.
     * @param _amount Freeze amount being validated.
     */
    function checkNonZeroFreezeAmount(uint256 _amount) internal pure {
        if (_amount == 0) revert IFreeze.InvalidFreezeAmount();
    }

    /**
     * @notice Increments the recipient's partition balance during an unfreeze, creating the
     *         partition entry on the holder if absent.
     * @dev Private to keep the ERC1410 partition-bookkeeping detail out of the freeze interface
     *      surface; chooses between `increasePartitionOnly` and `addPartitionToOnly` based on
     *      whether `_to` already has an entry for `_partition`.
     * @param _partition Partition being restored.
     * @param _to Holder whose partition balance is being restored.
     * @param _amount Amount being restored.
     */
    function _transferFrozenBalanceOnly(bytes32 _partition, address _to, uint256 _amount) private {
        if (ERC1410StorageWrapper.validPartitionForReceiver(_partition, _to)) {
            ERC1410StorageWrapper.increasePartitionOnly(_to, _amount, _partition);
            return;
        }
        ERC1410StorageWrapper.addPartitionToOnly(_amount, _to, _partition);
    }

    /**
     * @notice Reverts unless the holder has at least `_amount` frozen on `_partition` at the
     *         supplied timestamp.
     * @dev Reads the partition-frozen balance through the adjusted accessor so historical
     *      adjustments are honoured; raises `InsufficientFrozenBalance` with the holder, amount
     *      requested, amount available, and partition for off-chain diagnostics.
     * @param _partition Partition whose frozen balance is being checked.
     * @param _userAddress Holder being checked.
     * @param _amount Amount the caller intends to unfreeze.
     * @param _timestamp Reference timestamp for adjustment-factor calculation.
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
}
