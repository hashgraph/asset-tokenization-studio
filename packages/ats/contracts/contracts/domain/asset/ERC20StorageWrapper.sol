// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { DEFAULT_PARTITION, KPI_ERC20_APPROVE_OWNER } from "../../constants/values.sol";
import { ICore } from "../../facets/core/ICore.sol";
import { ITransfer } from "../../facets/transfer/ITransfer.sol";
import { IAllowanceTypes } from "../../facets/allowance/IAllowanceTypes.sol";
import { IERC1410Types } from "../../facets/commonTypes/IERC1410Types.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";
import { ScheduledTasksOps } from "../orchestrator/ScheduledTasksOps.sol";
import { IAllowance } from "../../facets/allowance/IAllowance.sol";

/// @custom:hash storage Erc20
bytes32 constant STORAGE_LOCATION_ERC20 = 0xba2beddc557de36eb4836f4ff1fd9d33a28d780fce70d36cf80b490142788200;

/**
 * @title ERC20Storage
 * @notice Backing storage for the ERC-20 metadata, balances, and allowances of an asset.
 * @dev Sole source of truth for name, symbol, decimals, total supply, per-holder
 *      balances, and per-spender allowances; mutated only via `ERC20StorageWrapper`
 *      against the deterministic ERC-7201 slot.
 * @custom:storage-location erc7201:security.token.standard.storage.Erc20
 */
struct ERC20Storage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    uint8 decimals;
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    string name;
    string symbol;
    uint256 totalSupply;
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowed;

    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title ERC20StorageWrapper - ERC-20 Storage Wrapper
 * @notice Storage wrapper for ERC-20 metadata, balance, and allowance data on a
 *         security token.
 * @dev Reads and writes the dedicated storage slot defined by
 *      `STORAGE_LOCATION_ERC20`. All functions are `internal` — the library is
 *      inlined at every call-site. External callers interact through the facet
 *      layer, never directly.
 * @author Asset Tokenization Studio Team
 */
library ERC20StorageWrapper {
    /**
     * @notice Initialises the ERC-20 storage with metadata from the deployment
     *         configuration and marks the slot as initialised.
     * @dev Writes name, symbol and decimals from `erc20Metadata`. One-shot
     *      guarantee is enforced by the caller via `onlyNotERC20Initialized`.
     * @param erc20Metadata The metadata struct containing the token identity fields.
     */
    function initializeERC20(ICore.ERC20Metadata calldata erc20Metadata) internal {
        ScheduledTasksOps.triggerPendingScheduledCrossOrderedTasks();
        ERC20Storage storage erc20Stor = _erc20Storage();
        erc20Stor.name = erc20Metadata.name;
        erc20Stor.symbol = erc20Metadata.symbol;
        erc20Stor.decimals = erc20Metadata.decimals;
    }

    /**
     * @notice Overwrites the token name in the ERC-20 storage slot.
     * @param _name The new token name to store.
     */
    function setName(string calldata _name) internal {
        _erc20Storage().name = _name;
    }

    /**
     * @notice Overwrites the token symbol in the ERC-20 storage slot.
     * @param _symbol The new token symbol to store.
     */
    function setSymbol(string calldata _symbol) internal {
        _erc20Storage().symbol = _symbol;
    }

    /**
     * @notice Overwrites the decimal count in the ERC-20 storage slot.
     * @dev This is a minimal raw-struct setter intended for test scaffolding
     *      (`MockDiamondCutHelpers.forceDecimals`). It writes only the `decimals`
     *      field via the private `_erc20Storage()` accessor and does NOT
     *      trigger `ScheduledTasksOps` or overwrite name/symbol — making it
     *      safe to use alongside snapshot scheduled-tasks tests.
     * @param _newDecimals The new decimal count to store.
     */
    function setDecimals(uint8 _newDecimals) internal {
        _erc20Storage().decimals = _newDecimals;
    }

    /// @notice Updates ERC-20 balances and emits the EIP-20 Transfer event.
    /// @dev Single source of truth for all balance-changing operations.
    ///      `from == address(0)` skips the debit (mint path).
    ///      `to == address(0)` skips the credit (burn path).
    /// @param from  Account whose balance is reduced (address(0) for mints).
    /// @param to    Account whose balance is increased (address(0) for burns).
    /// @param amount Token amount transferred.
    function performTransfer(address from, address to, uint256 amount) internal {
        if (from != address(0)) reduceBalance(from, amount);
        if (to != address(0)) increaseBalance(to, amount);
        emit ITransfer.Transfer(from, to, amount);
    }

    /**
     * @notice Adds `value` to the ERC-20 balance of `to`.
     * @dev Uses `unchecked` arithmetic; the caller is responsible for ensuring
     *      the resulting balance does not overflow `uint256`.
     * @param to    Account whose balance is increased.
     * @param value Amount to add.
     */
    function increaseBalance(address to, uint256 value) internal {
        unchecked {
            _erc20Storage().balances[to] += value;
        }
    }

    /**
     * @notice Subtracts `value` from the ERC-20 balance of `from`.
     * @dev Uses `unchecked` arithmetic; the caller is responsible for ensuring
     *      the balance does not underflow.
     * @param from  Account whose balance is reduced.
     * @param value Amount to subtract.
     */
    function reduceBalance(address from, uint256 value) internal {
        unchecked {
            _erc20Storage().balances[from] -= value;
        }
    }

    /**
     * @notice Adds `value` to the token total supply.
     * @dev Uses `unchecked` arithmetic; the caller must guarantee no overflow.
     * @param value Amount to add to the total supply.
     */
    function increaseTotalSupply(uint256 value) internal {
        unchecked {
            _erc20Storage().totalSupply += value;
        }
    }

    /**
     * @notice Subtracts `value` from the token total supply.
     * @dev Uses `unchecked` arithmetic; the caller must guarantee no underflow.
     * @param value Amount to subtract from the total supply.
     */
    function reduceTotalSupply(uint256 value) internal {
        unchecked {
            _erc20Storage().totalSupply -= value;
        }
    }

    /**
     * @notice Multiplies the total supply by `factor` in-place.
     * @dev Used during balance-adjustment operations to keep total supply
     *      consistent with per-holder balance changes.
     * @param factor Multiplier to apply to the current total supply.
     */
    function adjustTotalSupply(uint256 factor) internal {
        _erc20Storage().totalSupply *= factor;
    }

    /**
     * @notice Adds `adjustedDecimals` to the stored decimal count.
     * @dev Accumulates pending decimal adjustments originating from scheduled
     *      balance-adjustment tasks.
     * @param adjustedDecimals Number of decimal places to add.
     */
    function adjustDecimals(uint8 adjustedDecimals) internal {
        _erc20Storage().decimals += adjustedDecimals;
    }

    /**
     * @notice Recomputes and stores the adjusted ERC-20 balance for `account`
     *         using the given accumulated balance-adjustment factor.
     * @dev Applies `calculateFactorByAbafAndTokenHolder` to derive the new
     *      balance. If the balance changed, emits a synthetic `Transfer` event
     *      from `address(0)` to `address(0)` to signal the adjustment. Then
     *      updates the holder's LABAF checkpoint via
     *      `AdjustBalancesStorageWrapper.updateLabafByTokenHolder`.
     * @param abaf    Current accumulated balance-adjustment factor.
     * @param account Token-holder address whose balance is being adjusted.
     */
    function adjustTotalBalanceFor(uint256 abaf, address account) internal {
        uint256 oldBalance = _erc20Storage().balances[account];
        uint256 newBalance = oldBalance *
            AdjustBalancesStorageWrapper.calculateFactorByAbafAndTokenHolder(abaf, account);
        if (newBalance != oldBalance) {
            _erc20Storage().balances[account] = newBalance;
            unchecked {
                emit ITransfer.Transfer(address(0), address(0), newBalance - oldBalance);
            }
        }
        AdjustBalancesStorageWrapper.updateLabafByTokenHolder(abaf, account);
    }

    /**
     * @notice Synchronises ERC-1410 state for `owner` and updates the stored
     *         allowance to reflect any pending balance-adjustment factor.
     * @dev Calls `triggerAndSyncAll` on the default partition for `owner` before
     *      delegating to `updateAllowanceAndLabaf`. Must be called before any
     *      operation that reads or modifies an allowance.
     * @param owner   Token owner whose ERC-1410 state is synchronised.
     * @param spender Spender whose allowance checkpoint is updated.
     */
    function beforeAllowanceUpdate(address owner, address spender) internal {
        ERC1410StorageWrapper.triggerAndSyncAll(DEFAULT_PARTITION, owner, address(0));
        updateAllowanceAndLabaf(owner, spender);
    }

    /**
     * @notice Scales the stored allowance for `(owner, spender)` by the ratio of
     *         the current ABAF to the spender's last-known ABAF, then updates the
     *         LABAF checkpoint.
     * @dev If `abaf == labaf` the allowance is already current and the function
     *      returns early without writing to storage.
     * @param owner   Token owner of the allowance.
     * @param spender Spender whose allowance is scaled.
     */
    function updateAllowanceAndLabaf(address owner, address spender) internal {
        if (isInfiniteAllowance(owner, spender)) return;
        uint256 abaf = AdjustBalancesStorageWrapper.getAbaf();
        uint256 labaf = AdjustBalancesStorageWrapper.getAllowanceLabaf(owner, spender);

        if (abaf == labaf) return;

        _erc20Storage().allowed[owner][spender] *= AdjustBalancesStorageWrapper.calculateFactor(abaf, labaf);
        AdjustBalancesStorageWrapper.updateAllowanceLabaf(owner, spender, abaf);
    }

    /**
     * @notice Sets the ERC-20 allowance of `spender` on behalf of `owner` to `value`
     *         and emits an `Approval` event.
     * @dev Reverts with `SpenderWithZeroAddress` if `spender` is the zero address.
     *      Synchronises ERC-1410 state and updates the ABAF checkpoint before
     *      writing the new allowance.
     * @param owner   Address granting the allowance. Must not be the zero address.
     * @param spender Address permitted to spend `value` tokens on behalf of `owner`.
     * @param value   Allowance amount to set.
     * @return True unconditionally on success; reverts on failure.
     */
    function approve(address owner, address spender, uint256 value) internal returns (bool) {
        _checkUnexpectedError(owner == address(0), KPI_ERC20_APPROVE_OWNER);

        _checkSpenderWithZeroAddress(spender);

        ERC1410StorageWrapper.triggerAndSyncAll(DEFAULT_PARTITION, owner, spender);
        _erc20Storage().allowed[owner][spender] = value;
        AdjustBalancesStorageWrapper.updateAllowanceLabaf(owner, spender, AdjustBalancesStorageWrapper.getAbaf());
        emit IAllowanceTypes.Approval(owner, spender, value);
        return true;
    }

    /**
     * @notice Increases the ERC-20 allowance of `spender` for `msg.sender` by `addedValue`.
     * @dev Reverts with `SpenderWithZeroAddress` if `spender` is the zero address.
     *      Delegates to `increaseAllowedBalance` which synchronises ABAF state and
     *      emits an `Approval` event.
     * @param spender    Address whose allowance is increased.
     * @param addedValue Amount to add to the existing allowance.
     * @return success_  True unconditionally on success; reverts on failure.
     */
    function increaseAllowance(address spender, uint256 addedValue) internal returns (bool success_) {
        _checkSpenderWithZeroAddress(spender);
        success_ = increaseAllowedBalance(EvmAccessors.getMsgSender(), spender, addedValue);
    }

    /**
     * @notice Decreases the ERC-20 allowance of `spender` for `msg.sender` by `subtractedValue`.
     * @dev Reverts with `SpenderWithZeroAddress` if `spender` is the zero address.
     *      Synchronises ABAF state via `beforeAllowanceUpdate` before reducing the allowance.
     *      Reverts via `decreaseAllowedBalance` if the existing allowance is insufficient.
     *      Emits an `Approval` event upon success.
     * @param spender         Address whose allowance is decreased.
     * @param subtractedValue Amount to subtract from the existing allowance.
     * @return success_       True unconditionally on success; reverts on failure.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) internal returns (bool success_) {
        _checkSpenderWithZeroAddress(spender);
        success_ = decreaseAllowedBalance(EvmAccessors.getMsgSender(), spender, subtractedValue);
    }

    /**
     * @notice Transfers `value` tokens from `from` to `to` using the allowance
     *         granted to `spender`, consuming the allowance in the process.
     * @dev Decreases the allowance of `spender` on `from`'s balance, then delegates
     *      to `ERC1410StorageWrapper.transferByPartition` on the default partition.
     * @param spender Address authorised to perform the transfer.
     * @param from    Source account whose balance is debited.
     * @param to      Destination account whose balance is credited.
     * @param value   Amount of tokens to transfer.
     * @return True unconditionally on success; reverts on failure.
     */
    function transferFrom(address spender, address from, address to, uint256 value) internal returns (bool) {
        decreaseAllowedBalance(from, spender, value);
        ERC1410StorageWrapper.transferByPartition(
            from,
            IERC1410Types.BasicTransferInfo(to, value),
            DEFAULT_PARTITION,
            "",
            spender,
            ""
        );
        return true;
    }

    /**
     * @notice Transfers `value` tokens from `from` to `to` on the default partition
     *         without consuming any allowance.
     * @dev Delegates directly to `ERC1410StorageWrapper.transferByPartition` with no
     *      operator address.
     * @param from  Source account.
     * @param to    Destination account.
     * @param value Amount of tokens to transfer.
     * @return True unconditionally on success; reverts on failure.
     */
    function transfer(address from, address to, uint256 value) internal returns (bool) {
        ERC1410StorageWrapper.transferByPartition(
            from,
            IERC1410Types.BasicTransferInfo(to, value),
            DEFAULT_PARTITION,
            "",
            address(0),
            ""
        );
        return true;
    }

    /**
     * @notice Issues `value` tokens to `to` on the default partition.
     * @dev Delegates to `ERC1410StorageWrapper.issueByPartition`.
     * @param to    Recipient of the minted tokens.
     * @param value Amount of tokens to mint.
     */
    function mint(address to, uint256 value) internal {
        ERC1410StorageWrapper.issueByPartition(IERC1410Types.IssueData(DEFAULT_PARTITION, to, value, ""));
    }

    /**
     * @notice Redeems `value` tokens from `from` on the default partition.
     * @dev Delegates to `ERC1410StorageWrapper.redeemByPartition`.
     * @param from  Account whose tokens are burned.
     * @param value Amount of tokens to burn.
     */
    function burn(address from, uint256 value) internal {
        ERC1410StorageWrapper.redeemByPartition(DEFAULT_PARTITION, from, address(0), value, "", "");
    }

    /**
     * @notice Burns `value` tokens from `account` using the allowance granted to
     *         `msg.sender`.
     * @dev Consumes the allowance via `decreaseAllowedBalance` before delegating
     *      to `burn`.
     * @param account Address whose tokens are burned.
     * @param value   Amount of tokens to burn.
     */
    function burnFrom(address account, uint256 value) internal {
        decreaseAllowedBalance(account, EvmAccessors.getMsgSender(), value);
        burn(account, value);
    }

    /**
     * @notice Decreases the spending allowance granted by `owner` to `spender` by `value`.
     * @dev Synchronises ABAF state via `beforeAllowanceUpdate` before performing any adjustments.
     *      If the existing allowance is infinite (`type(uint256).max`), the function returns
     *      `false` without modifying state or emitting an event.
     *      Reverts with unexpected error `KPI_ERC20_APPROVE_OWNER` if `owner` is the zero address.
     *      Reverts with `IAllowanceTypes.InsufficientAllowance` if `value` exceeds current allowance.
     *      Emits an `IAllowanceTypes.Approval` event upon a successful finite allowance deduction.
     * @param owner Address of the token owner whose allowance is being deducted.
     * @param spender Address authorised to spend tokens on behalf of `owner`.
     * @param value Amount to deduct from the current allowance.
     * @return True if a finite allowance was decremented, false if the allowance is infinite.
     */
    function decreaseAllowedBalance(address owner, address spender, uint256 value) internal returns (bool) {
        _checkUnexpectedError(owner == address(0), KPI_ERC20_APPROVE_OWNER);
        beforeAllowanceUpdate(owner, spender);
        if (isInfiniteAllowance(owner, spender)) return false;
        ERC20Storage storage erc20Stor = _erc20Storage();
        uint256 currentAllowance = erc20Stor.allowed[owner][spender];
        if (value > currentAllowance) revert IAllowanceTypes.InsufficientAllowance(spender, owner);
        unchecked {
            erc20Stor.allowed[owner][spender] = currentAllowance - value;
        }
        emit IAllowanceTypes.Approval(owner, spender, erc20Stor.allowed[owner][spender]);
        return true;
    }

    /**
     * @notice Increases the allowance granted to `spender` by `owner` by `value`.
     * @dev Reverts with `KPI_ERC20_APPROVE_OWNER` if `owner` is the zero address.
     *      Executes `beforeAllowanceUpdate` hook to synchronise ABAF state prior to mutation.
     *      Returns `false` without modifying storage if `spender` already has infinite allowance.
     *      Mutates `ERC20Storage` state and emits an `IAllowanceTypes.Approval` event upon success.
     * @param owner Address of the token owner granting the allowance increase.
     * @param spender Address of the spender whose allowance is increased.
     * @param value Amount of additional tokens allowed to be spent.
     * @return True if the allowance was increased, false if allowance is infinite.
     */
    function increaseAllowedBalance(address owner, address spender, uint256 value) internal returns (bool) {
        _checkUnexpectedError(owner == address(0), KPI_ERC20_APPROVE_OWNER);
        beforeAllowanceUpdate(owner, spender);
        if (isInfiniteAllowance(owner, spender)) return false;
        ERC20Storage storage erc20Stor = _erc20Storage();
        erc20Stor.allowed[owner][spender] += value;
        emit IAllowanceTypes.Approval(owner, spender, _erc20Storage().allowed[owner][spender]);
        return true;
    }

    /**
     * @notice Returns the current ERC-20 total supply.
     * @return The total number of tokens in circulation.
     */
    function totalSupply() internal view returns (uint256) {
        return _erc20Storage().totalSupply;
    }

    /**
     * @notice Returns the ERC-20 balance of `tokenHolder`.
     * @param tokenHolder Address to query.
     * @return The token balance of `tokenHolder`.
     */
    function balanceOf(address tokenHolder) internal view returns (uint256) {
        return _erc20Storage().balances[tokenHolder];
    }

    /**
     * @notice Returns the current ERC-20 allowance that `owner` has granted to
     *         `spender`.
     * @param owner   Address that granted the allowance.
     * @param spender Address permitted to spend on `owner`'s behalf.
     * @return The remaining allowance for `spender` on `owner`'s balance.
     */
    function allowance(address owner, address spender) internal view returns (uint256) {
        return _erc20Storage().allowed[owner][spender];
    }

    /**
     * @notice Returns the stored token name.
     * @return The ERC-20 token name string.
     */
    function getName() internal view returns (string memory) {
        return _erc20Storage().name;
    }

    /**
     * @notice Returns the stored token symbol.
     * @return The ERC-20 token symbol string.
     */
    function getSymbol() internal view returns (string memory) {
        return _erc20Storage().symbol;
    }

    /**
     * @notice Returns the number of decimal places used by the token.
     * @return The ERC-20 decimals value.
     */
    function decimals() internal view returns (uint8) {
        return _erc20Storage().decimals;
    }

    /**
     * @notice Returns the ERC-20 metadata (name, symbol and decimals) read from storage.
     * @return erc20Metadata_ The `ICore.ERC20Metadata` value read from storage.
     */
    function getERC20Metadata() internal view returns (ICore.ERC20Metadata memory erc20Metadata_) {
        ERC20Storage storage erc20Stor = _erc20Storage();
        erc20Metadata_ = ICore.ERC20Metadata({
            name: erc20Stor.name,
            symbol: erc20Stor.symbol,
            decimals: erc20Stor.decimals
        });
    }

    /**
     * @notice Returns ERC-20 metadata projected forward to `timestamp`, incorporating
     *         any pending decimal adjustment scheduled before that point.
     * @dev Queries `ScheduledTasksStorageWrapper.getPendingScheduledBalanceAdjustmentsAt`
     *      to obtain the pending decimal delta, then adds it to the stored decimals.
     * @param timestamp Unix timestamp at which to project the metadata.
     * @return erc20Metadata_ The projected `ICore.ERC20Metadata` value.
     */
    function getERC20MetadataAdjustedAt(
        uint256 timestamp
    ) internal view returns (ICore.ERC20Metadata memory erc20Metadata_) {
        (, uint8 pendingDecimals) = ScheduledTasksStorageWrapper.getPendingScheduledBalanceAdjustmentsAt(
            timestamp,
            false
        );
        erc20Metadata_ = getERC20Metadata();
        erc20Metadata_.decimals += pendingDecimals;
    }

    /**
     * @notice Returns the effective decimal count at `timestamp`, incorporating any
     *         pending decimal adjustment scheduled before that point.
     * @param timestamp Unix timestamp at which to project the decimal count.
     * @return The projected decimal count.
     */
    function decimalsAdjustedAt(uint256 timestamp) internal view returns (uint8) {
        return getERC20MetadataAdjustedAt(timestamp).decimals;
    }

    /**
     * @notice Returns the effective allowance of `spender` on `owner`'s balance
     *         projected to `timestamp`, incorporating any pending balance-adjustment
     *         factor.
     * @dev Scales the current stored allowance by the ratio of the projected ABAF at
     *      `timestamp` to the spender's last-known ABAF checkpoint.
     * @param owner     Address that granted the allowance.
     * @param spender   Address permitted to spend on `owner`'s behalf.
     * @param timestamp Unix timestamp at which to project the allowance.
     * @return allowance_ The projected allowance amount.
     */
    function allowanceAdjustedAt(
        address owner,
        address spender,
        uint256 timestamp
    ) internal view returns (uint256 allowance_) {
        allowance_ = allowance(owner, spender);
        return
            allowance_ == type(uint256).max
                ? allowance_
                : allowance_ *
                    AdjustBalancesStorageWrapper.calculateFactor(
                        AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp),
                        AdjustBalancesStorageWrapper.getAllowanceLabaf(owner, spender)
                    );
    }

    /**
     * @notice Checks whether a spender has an unlimited allowance from an owner.
     * @dev Treats `type(uint256).max` as an infinite allowance sentinel.
     * @param _owner Account that granted the allowance.
     * @param _spender Account authorised to spend the owner's tokens.
     * @return infinite_ True if the current allowance equals the maximum uint256 value.
     */
    function isInfiniteAllowance(address _owner, address _spender) internal view returns (bool infinite_) {
        infinite_ = allowance(_owner, _spender) == type(uint256).max;
    }

    /**
     * @notice Ensures that a spender does not have an infinite allowance from an owner.
     * @dev Reverts with `InfiniteAllowance` when the allowance equals `type(uint256).max`.
     * @param _owner Address that granted the allowance.
     * @param _spender Address authorised to spend the owner's tokens.
     */
    function checkFiniteAllowance(address _owner, address _spender) internal view {
        if (isInfiniteAllowance(_owner, _spender)) revert IAllowance.InfiniteAllowance(_owner, _spender);
    }

    /**
     * @notice Validates that the specified spender is not the zero address.
     * @dev Reverts with `IAllowanceTypes.SpenderWithZeroAddress` if `spender` is `address(0)`.
     * @param spender The address of the spender to validate.
     */
    function _checkSpenderWithZeroAddress(address spender) private pure {
        if (spender == address(0)) revert IAllowanceTypes.SpenderWithZeroAddress();
    }

    /**
     * @notice Returns a storage pointer to the ERC-7201 namespaced `ERC20Storage` slot.
     * @dev Uses inline assembly to set the storage pointer to `STORAGE_LOCATION_ERC20`.
     *      All other functions in this library must obtain their storage reference
     *      through this accessor.
     * @return erc20Storage_ Storage pointer to the ERC-20 data slot.
     */
    function _erc20Storage() private pure returns (ERC20Storage storage erc20Storage_) {
        bytes32 position = STORAGE_LOCATION_ERC20;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc20Storage_.slot := position
        }
    }
}
