// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC20_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { _DEFAULT_PARTITION, KPI_ERC20_APPROVE_OWNER } from "../../constants/values.sol";
import { IERC20 } from "../../facets/layer_1/ERC1400/ERC20/IERC20.sol";
// IERC20StorageWrapper is now merged into IERC20
import { IERC1410Types } from "../../facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { IFactory } from "../../factory/IFactory.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";

/**
 * @notice Diamond Storage struct for ERC20 token state.
 * @dev    Stored at `_ERC20_STORAGE_POSITION`. The `balances` and `totalSupply` fields
 *         are populated lazily via migration from legacy ERC1410 storage on first write;
 *         until migration occurs, the canonical values are held in `ERC1410StorageWrapper`.
 *         `decimals` is treated as an additive accumulator: `adjustDecimals` increments
 *         it rather than overwriting, so callers must track the delta rather than the
 *         target value.
 * @param name          Human-readable token name.
 * @param symbol        Trading symbol for the token.
 * @param isin          International Securities Identification Number for the instrument.
 * @param decimals      Current decimal precision; may be incremented by balance adjustment
 *                      operations.
 * @param initialized   True once `initializeERC20` has been called; guards against
 *                      uninitialised reads.
 * @param allowed       Nested mapping of ERC20 allowances: owner → spender → amount.
 * @param securityType  Classification of the security instrument as defined by `IFactory`.
 * @param totalSupply   Aggregate token supply tracked in this storage slot; zero until
 *                      migrated from legacy ERC1410 storage.
 * @param balances      Per-account token balances tracked in this storage slot; zero for
 *                      any account not yet migrated from legacy ERC1410 storage.
 */
struct ERC20Storage {
    string name;
    string symbol;
    string isin;
    uint8 decimals;
    bool initialized;
    mapping(address => mapping(address => uint256)) allowed;
    IFactory.SecurityType securityType;
    uint256 totalSupply;
    mapping(address => uint256) balances;
}

/**
 * @title  ERC20StorageWrapper
 * @notice Internal library providing storage operations for ERC20 token metadata,
 *         balances, allowances, and token lifecycle functions (mint, burn, transfer).
 * @dev    Anchors `ERC20Storage` at `_ERC20_STORAGE_POSITION` following the ERC-2535
 *         Diamond Storage Pattern. All functions are `internal` and intended exclusively
 *         for use within facets or other internal libraries of the same diamond.
 *
 *         Balance and total supply reads transparently fall back to legacy ERC1410
 *         storage until migration is triggered. Migration is lazy: it fires on the first
 *         write to a balance or to `totalSupply`, ensuring historical data is never lost.
 *
 *         Allowances are subject to ABAF (Adjustment Balance Adjustment Factor) scaling.
 *         Before any allowance mutation, `beforeAllowanceUpdate` must be called to sync
 *         pending adjustments; this is enforced internally by all mutating functions.
 *
 *         All token transfers, issuances, and redemptions delegate to
 *         `ERC1410StorageWrapper` under `_DEFAULT_PARTITION`, making this library a
 *         thin ERC20 projection over the ERC1410 partitioned balance model.
 * @author Hashgraph
 */
library ERC20StorageWrapper {
    /**
     * @notice Initialises the ERC20 storage with the provided token metadata and marks
     *         the subsystem as initialised.
     * @dev    Must be called exactly once during diamond deployment or facet initialisation.
     *         Calling this a second time overwrites all metadata fields and re-sets the
     *         `initialized` flag; callers must enforce single-initialisation at the facet
     *         level. Does not initialise balances or total supply.
     * @param erc20Metadata  Struct containing token name, symbol, ISIN, decimal precision,
     *                       and security type classification.
     */
    function initializeERC20(IERC20.ERC20Metadata calldata erc20Metadata) internal {
        ERC20Storage storage erc20Stor = erc20Storage();
        erc20Stor.name = erc20Metadata.info.name;
        erc20Stor.symbol = erc20Metadata.info.symbol;
        erc20Stor.isin = erc20Metadata.info.isin;
        erc20Stor.decimals = erc20Metadata.info.decimals;
        erc20Stor.securityType = erc20Metadata.securityType;
        erc20Stor.initialized = true;
    }

    /**
     * @notice Replaces the stored token name.
     * @dev    Overwrites the `name` field directly without emitting an event. Callers
     *         are responsible for any required access control and event emission.
     * @param _name  New token name to store.
     */
    function setName(string calldata _name) internal {
        erc20Storage().name = _name;
    }

    /**
     * @notice Replaces the stored token symbol.
     * @dev    Overwrites the `symbol` field directly without emitting an event. Callers
     *         are responsible for any required access control and event emission.
     * @param _symbol  New token symbol to store.
     */
    function setSymbol(string calldata _symbol) internal {
        erc20Storage().symbol = _symbol;
    }

    /**
     * @notice Increases the ERC20 balance of an account, migrating from legacy ERC1410
     *         storage first if required.
     * @dev    Triggers `migrateBalanceIfNeeded` before the increment to ensure the
     *         balance slot is populated from legacy storage. Uses `unchecked` arithmetic;
     *         overflow protection is the caller's responsibility. Does not emit a
     *         `Transfer` event; callers must emit where required.
     * @param to     Account whose balance is to be increased.
     * @param value  Amount by which to increase the balance.
     */
    function increaseBalance(address to, uint256 value) internal {
        migrateBalanceIfNeeded(to);
        unchecked {
            erc20Storage().balances[to] += value;
        }
    }

    /**
     * @notice Decreases the ERC20 balance of an account, migrating from legacy ERC1410
     *         storage first if required.
     * @dev    Triggers `migrateBalanceIfNeeded` before the decrement to ensure the
     *         balance slot is populated from legacy storage. Uses `unchecked` arithmetic;
     *         underflow protection is the caller's responsibility. Does not emit a
     *         `Transfer` event; callers must emit where required.
     * @param from   Account whose balance is to be decreased.
     * @param value  Amount by which to decrease the balance.
     */
    function reduceBalance(address from, uint256 value) internal {
        migrateBalanceIfNeeded(from);
        unchecked {
            erc20Storage().balances[from] -= value;
        }
    }

    /**
     * @notice Increases the total supply, migrating from legacy ERC1410 storage first
     *         if required.
     * @dev    Triggers `migrateTotalSupplyIfNeeded` before the increment. Uses `unchecked`
     *         arithmetic; overflow protection is the caller's responsibility.
     * @param value  Amount by which to increase the total supply.
     */
    function increaseTotalSupply(uint256 value) internal {
        migrateTotalSupplyIfNeeded();
        unchecked {
            erc20Storage().totalSupply += value;
        }
    }

    /**
     * @notice Decreases the total supply, migrating from legacy ERC1410 storage first
     *         if required.
     * @dev    Triggers `migrateTotalSupplyIfNeeded` before the decrement. Uses `unchecked`
     *         arithmetic; underflow protection is the caller's responsibility.
     * @param value  Amount by which to decrease the total supply.
     */
    function reduceTotalSupply(uint256 value) internal {
        migrateTotalSupplyIfNeeded();
        unchecked {
            erc20Storage().totalSupply -= value;
        }
    }

    /**
     * @notice Scales the total supply by a multiplicative factor, migrating from legacy
     *         ERC1410 storage first if required.
     * @dev    Triggers `migrateTotalSupplyIfNeeded` before the multiplication. Callers
     *         must ensure `factor` is non-zero to avoid zeroing the total supply. Intended
     *         for token adjustment operations such as splits or consolidations.
     * @param factor  Multiplicative scaling factor to apply to the total supply.
     */
    function adjustTotalSupply(uint256 factor) internal {
        migrateTotalSupplyIfNeeded();
        erc20Storage().totalSupply *= factor;
    }

    /**
     * @notice Increments the stored decimal precision by the given delta.
     * @dev    Adds `adjustedDecimals` to the current `decimals` value rather than
     *         overwriting it. Callers must pass the incremental delta, not the target
     *         precision. Overflow of `uint8` is not guarded; callers must validate the
     *         resulting precision does not exceed 255.
     * @param adjustedDecimals  Decimal precision delta to add to the current value.
     */
    function adjustDecimals(uint8 adjustedDecimals) internal {
        erc20Storage().decimals += adjustedDecimals;
    }

    /**
     * @notice Applies a pending balance adjustment factor to a specific account's ERC20
     *         balance and emits a `Transfer` event for the delta if the balance changes.
     * @dev    Migrates the balance from legacy storage if needed before applying the
     *         factor. The new balance is computed as `oldBalance * factor` where `factor`
     *         is derived from `AdjustBalancesStorageWrapper.calculateFactorByAbafAndTokenHolder`.
     *         If the balance is unchanged, no event is emitted and no storage write occurs.
     *         The `Transfer` event is emitted with `address(0)` for both `from` and `to`,
     *         signalling a balance adjustment rather than a conventional transfer.
     *         Finalises by calling `AdjustBalancesStorageWrapper.updateLabafByTokenHolder`
     *         to record the applied adjustment factor.
     * @param abaf     Current global adjustment balance factor to apply.
     * @param account  Account whose balance is to be adjusted.
     */
    function adjustTotalBalanceFor(uint256 abaf, address account) internal {
        migrateBalanceIfNeeded(account);
        uint256 oldBalance = erc20Storage().balances[account];
        uint256 newBalance = oldBalance *
            AdjustBalancesStorageWrapper.calculateFactorByAbafAndTokenHolder(abaf, account);
        if (newBalance != oldBalance) {
            erc20Storage().balances[account] = newBalance;
            unchecked {
                emit IERC20.Transfer(address(0), address(0), newBalance - oldBalance);
            }
        }
        AdjustBalancesStorageWrapper.updateLabafByTokenHolder(abaf, account);
    }

    /**
     * @notice Synchronises pending ERC1410 balance changes for an account and updates
     *         the allowance ABAF alignment for an owner–spender pair before an allowance
     *         mutation.
     * @dev    Must be called before any operation that reads or writes an allowance value
     *         to ensure the stored allowance reflects any outstanding balance adjustments.
     *         Delegates ERC1410 synchronisation to `ERC1410StorageWrapper.triggerAndSyncAll`
     *         on `_DEFAULT_PARTITION`, then adjusts the allowance via
     *         `updateAllowanceAndLabaf`. Callers that invoke `decreaseAllowedBalance` or
     *         `increaseAllowedBalance` have this called implicitly.
     * @param owner    Address whose ERC1410 state is synchronised and whose allowance
     *                 is to be adjusted.
     * @param spender  Address of the spender whose allowance is to be aligned.
     */
    function beforeAllowanceUpdate(address owner, address spender) internal {
        ERC1410StorageWrapper.triggerAndSyncAll(_DEFAULT_PARTITION, owner, address(0));
        updateAllowanceAndLabaf(owner, spender);
    }

    /**
     * @notice Scales a stored allowance to account for any global balance adjustment
     *         factor changes since it was last updated, then records the new LABAF.
     * @dev    Reads the current ABAF and the stored allowance LABAF for the pair. If they
     *         match, no state change occurs. Otherwise, the allowance is multiplied by
     *         `calculateFactor(abaf, labaf)` and the allowance LABAF is updated to `abaf`.
     *         This function is idempotent when ABAF has not changed since the last call.
     * @param owner    Address of the allowance owner.
     * @param spender  Address of the spender whose allowance is to be aligned.
     */
    function updateAllowanceAndLabaf(address owner, address spender) internal {
        uint256 abaf = AdjustBalancesStorageWrapper.getAbaf();
        uint256 labaf = AdjustBalancesStorageWrapper.getAllowanceLabaf(owner, spender);
        if (abaf == labaf) return;
        erc20Storage().allowed[owner][spender] *= AdjustBalancesStorageWrapper.calculateFactor(abaf, labaf);
        AdjustBalancesStorageWrapper.updateAllowanceLabaf(owner, spender, abaf);
    }

    /**
     * @notice Sets the allowance of `spender` over `owner`'s tokens to `value` and
     *         emits `IERC20.Approval`.
     * @dev    Triggers `_checkUnexpectedError` with `KPI_ERC20_APPROVE_OWNER` if `owner`
     *         is `address(0)`, which is treated as an unexpected system error rather than
     *         a user-facing revert. Reverts with `IERC20.SpenderWithZeroAddress` if
     *         `spender` is `address(0)`. Does not call `beforeAllowanceUpdate`; callers
     *         must ensure ABAF alignment if required before invoking this function.
     *         Emits: `IERC20.Approval`.
     * @param owner    Address granting the allowance.
     * @param spender  Address receiving the allowance.
     * @param value    New allowance amount.
     * @return True on success.
     */
    function approve(address owner, address spender, uint256 value) internal returns (bool) {
        _checkUnexpectedError(owner == address(0), KPI_ERC20_APPROVE_OWNER);
        if (spender == address(0)) {
            revert IERC20.SpenderWithZeroAddress();
        }
        erc20Storage().allowed[owner][spender] = value;
        emit IERC20.Approval(owner, spender, value);
        return true;
    }

    /**
     * @notice Increases the allowance granted by `msg.sender` to `spender` by
     *         `addedValue`.
     * @dev    Reverts with `IERC20.SpenderWithZeroAddress` if `spender` is `address(0)`.
     *         Delegates to `increaseAllowedBalance`, which internally calls
     *         `beforeAllowanceUpdate` to synchronise ABAF alignment before the mutation.
     *         Emits: `IERC20.Approval` (via `increaseAllowedBalance`).
     * @param spender     Address whose allowance is to be increased.
     * @param addedValue  Amount to add to the current allowance.
     * @return True on success.
     */
    function increaseAllowance(address spender, uint256 addedValue) internal returns (bool) {
        if (spender == address(0)) {
            revert IERC20.SpenderWithZeroAddress();
        }
        increaseAllowedBalance(EvmAccessors.getMsgSender(), spender, addedValue);
        return true;
    }

    /**
     * @notice Decreases the allowance granted by `msg.sender` to `spender` by
     *         `subtractedValue`.
     * @dev    Reverts with `IERC20.SpenderWithZeroAddress` if `spender` is `address(0)`.
     *         Reverts with `IERC20.InsufficientAllowance` (via `decreaseAllowedBalance`)
     *         if the current allowance is less than `subtractedValue`. Calls
     *         `beforeAllowanceUpdate` internally via `decreaseAllowedBalance` to
     *         synchronise ABAF alignment.
     *         Emits: `IERC20.Approval` with the updated allowance after the reduction.
     * @param spender          Address whose allowance is to be decreased.
     * @param subtractedValue  Amount to subtract from the current allowance.
     * @return True on success.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) internal returns (bool) {
        if (spender == address(0)) {
            revert IERC20.SpenderWithZeroAddress();
        }
        decreaseAllowedBalance(EvmAccessors.getMsgSender(), spender, subtractedValue);
        emit IERC20.Approval(
            EvmAccessors.getMsgSender(),
            spender,
            erc20Storage().allowed[EvmAccessors.getMsgSender()][spender]
        );
        return true;
    }

    /**
     * @notice Transfers tokens from `from` to `to` on behalf of `spender`, consuming the
     *         corresponding allowance.
     * @dev    Decrements the allowance via `decreaseAllowedBalance` (which enforces ABAF
     *         alignment and reverts on insufficient allowance), then delegates the actual
     *         token movement to `ERC1410StorageWrapper.transferByPartition` under
     *         `_DEFAULT_PARTITION`. The `spender` is passed as the operator to the ERC1410
     *         layer.
     *         Emits: `IERC20.Transfer`.
     * @param spender  Address consuming the allowance and initiating the transfer.
     * @param from     Source address whose tokens are transferred.
     * @param to       Destination address to receive the tokens.
     * @param value    Token quantity to transfer.
     * @return True on success.
     */
    function transferFrom(address spender, address from, address to, uint256 value) internal returns (bool) {
        decreaseAllowedBalance(from, spender, value);
        ERC1410StorageWrapper.transferByPartition(
            from,
            IERC1410Types.BasicTransferInfo(to, value),
            _DEFAULT_PARTITION,
            "",
            spender,
            ""
        );
        emit IERC20.Transfer(from, to, value);
        return true;
    }

    /**
     * @notice Transfers tokens directly from `from` to `to` without consuming an
     *         allowance.
     * @dev    Delegates entirely to `ERC1410StorageWrapper.transferByPartition` under
     *         `_DEFAULT_PARTITION` with `address(0)` as the operator, indicating a
     *         self-initiated transfer. No allowance check is performed; callers are
     *         responsible for any access control validation.
     *         Emits: `IERC20.Transfer`.
     * @param from   Source address whose tokens are transferred.
     * @param to     Destination address to receive the tokens.
     * @param value  Token quantity to transfer.
     * @return True on success.
     */
    function transfer(address from, address to, uint256 value) internal returns (bool) {
        ERC1410StorageWrapper.transferByPartition(
            from,
            IERC1410Types.BasicTransferInfo(to, value),
            _DEFAULT_PARTITION,
            "",
            address(0),
            ""
        );
        emit IERC20.Transfer(from, to, value);
        return true;
    }

    /**
     * @notice Issues new tokens to `to` under the default partition and emits a
     *         `Transfer` event from `address(0)`.
     * @dev    Delegates to `ERC1410StorageWrapper.issueByPartition` under
     *         `_DEFAULT_PARTITION`. Callers are responsible for any supply cap validation
     *         and access control enforcement before invoking this function.
     *         Emits: `IERC20.Transfer` from `address(0)` to `to`.
     * @param to     Address to receive the newly minted tokens.
     * @param value  Token quantity to mint.
     */
    function mint(address to, uint256 value) internal {
        ERC1410StorageWrapper.issueByPartition(IERC1410Types.IssueData(_DEFAULT_PARTITION, to, value, ""));
        emit IERC20.Transfer(address(0), to, value);
    }

    /**
     * @notice Redeems tokens from `from` under the default partition and emits a
     *         `Transfer` event to `address(0)`.
     * @dev    Delegates to `ERC1410StorageWrapper.redeemByPartition` under
     *         `_DEFAULT_PARTITION` with `address(0)` as the operator. Callers are
     *         responsible for access control validation.
     *         Emits: `IERC20.Transfer` from `from` to `address(0)`.
     * @param from   Address whose tokens are to be redeemed.
     * @param value  Token quantity to redeem.
     */
    function burn(address from, uint256 value) internal {
        ERC1410StorageWrapper.redeemByPartition(_DEFAULT_PARTITION, from, address(0), value, "", "");
        emit IERC20.Transfer(from, address(0), value);
    }

    /**
     * @notice Redeems tokens from `account` on behalf of `msg.sender`, consuming the
     *         corresponding allowance.
     * @dev    Decrements the allowance granted by `account` to `msg.sender` via
     *         `decreaseAllowedBalance`, then delegates to `burn`. Reverts with
     *         `IERC20.InsufficientAllowance` if the allowance is insufficient.
     *         Emits: `IERC20.Transfer` from `account` to `address(0)` (via `burn`).
     * @param account  Address whose tokens are to be redeemed.
     * @param value    Token quantity to redeem.
     */
    function burnFrom(address account, uint256 value) internal {
        decreaseAllowedBalance(account, EvmAccessors.getMsgSender(), value);
        burn(account, value);
    }

    /**
     * @notice Synchronises ABAF alignment for an allowance and decrements it by `value`.
     * @dev    Calls `beforeAllowanceUpdate` to trigger ERC1410 sync and ABAF alignment
     *         before reading the stored allowance. Reverts with
     *         `IERC20.InsufficientAllowance` if the post-alignment allowance is less than
     *         `value`. Does not emit an event; callers are responsible for any required
     *         `Approval` emission.
     * @param from     Address that granted the allowance.
     * @param spender  Address whose allowance is to be decremented.
     * @param value    Amount to subtract from the current allowance.
     */
    function decreaseAllowedBalance(address from, address spender, uint256 value) internal {
        beforeAllowanceUpdate(from, spender);
        ERC20Storage storage erc20Stor = erc20Storage();
        if (value > erc20Stor.allowed[from][spender]) {
            revert IERC20.InsufficientAllowance(spender, from);
        }
        erc20Stor.allowed[from][spender] -= value;
    }

    /**
     * @notice Synchronises ABAF alignment for an allowance and increments it by `value`,
     *         then emits `IERC20.Approval`.
     * @dev    Calls `beforeAllowanceUpdate` to trigger ERC1410 sync and ABAF alignment
     *         before the increment. The `Approval` event is emitted with the post-increment
     *         allowance by re-reading from storage after the write.
     *         Emits: `IERC20.Approval`.
     * @param from     Address that is granting additional allowance.
     * @param spender  Address whose allowance is to be incremented.
     * @param value    Amount to add to the current allowance.
     */
    function increaseAllowedBalance(address from, address spender, uint256 value) internal {
        beforeAllowanceUpdate(from, spender);
        ERC20Storage storage erc20Stor = erc20Storage();
        erc20Stor.allowed[from][spender] += value;
        emit IERC20.Approval(from, spender, erc20Storage().allowed[from][spender]);
    }

    /**
     * @notice Migrates the total supply from legacy ERC1410 storage into `ERC20Storage`
     *         if a non-zero deprecated value exists.
     * @dev    Calls `ERC1410StorageWrapper.deprecateTotalSupplyIfNeeded`, which returns
     *         the legacy total supply and clears it from ERC1410 storage. If the returned
     *         value is zero, no migration is needed and this function is a no-op.
     *         Migration is permanent; subsequent calls will always find zero and return
     *         immediately. Must be called before any `totalSupply` write to preserve
     *         data integrity.
     */
    function migrateTotalSupplyIfNeeded() internal {
        uint256 legacyTotalSupply = ERC1410StorageWrapper.deprecateTotalSupplyIfNeeded();
        if (legacyTotalSupply == 0) return;
        erc20Storage().totalSupply = legacyTotalSupply;
    }

    /**
     * @notice Migrates the balance of a specific account from legacy ERC1410 storage into
     *         `ERC20Storage` if a non-zero deprecated value exists.
     * @dev    Calls `ERC1410StorageWrapper.deprecateBalanceIfNeeded`, which returns the
     *         legacy balance and clears it from ERC1410 storage for that account. If the
     *         returned value is zero, no migration is needed and this function is a no-op.
     *         Migration is permanent for the account; subsequent calls will always find
     *         zero and return immediately. Must be called before any balance write to
     *         preserve data integrity.
     * @param tokenHolder  Account whose legacy balance is to be migrated.
     */
    function migrateBalanceIfNeeded(address tokenHolder) internal {
        uint256 legacyBalance = ERC1410StorageWrapper.deprecateBalanceIfNeeded(tokenHolder);
        if (legacyBalance == 0) return;
        erc20Storage().balances[tokenHolder] = legacyBalance;
    }

    /**
     * @notice Returns the current total token supply, falling back to the deprecated
     *         ERC1410 total supply if the ERC20 slot has not yet been populated.
     * @dev    Checks the deprecated ERC1410 total supply first; a non-zero value indicates
     *         migration has not yet occurred for total supply and takes precedence.
     *         Once `migrateTotalSupplyIfNeeded` has been triggered (on any supply write),
     *         the ERC1410 deprecated value will be zero and this function reads directly
     *         from `ERC20Storage`.
     * @return totalSupply_  Current total token supply.
     */
    function totalSupply() internal view returns (uint256 totalSupply_) {
        totalSupply_ = ERC1410StorageWrapper.getDeprecatedTotalSupply();
        return totalSupply_ == 0 ? erc20Storage().totalSupply : totalSupply_;
    }

    /**
     * @notice Returns the token balance of an account, falling back to the deprecated
     *         ERC1410 balance if the ERC20 slot has not yet been populated for that
     *         account.
     * @dev    Checks the deprecated ERC1410 balance first; a non-zero value indicates
     *         migration has not yet occurred for the account and takes precedence. Once
     *         `migrateBalanceIfNeeded` has been triggered for an account (on any balance
     *         write), the ERC1410 deprecated value will be zero and this function reads
     *         directly from `ERC20Storage`.
     * @param tokenHolder  Address to query.
     * @return balance_    Token balance of `tokenHolder`.
     */
    function balanceOf(address tokenHolder) internal view returns (uint256 balance_) {
        balance_ = ERC1410StorageWrapper.getDeprecatedBalanceOf(tokenHolder);
        return balance_ == 0 ? erc20Storage().balances[tokenHolder] : balance_;
    }

    /**
     * @notice Returns the total supply directly from the ERC20 storage slot, bypassing
     *         the legacy ERC1410 fallback.
     * @dev    Intended for use in contexts where the caller has already confirmed that
     *         migration has occurred, or where only the post-migration value is relevant.
     *         Returns `0` if migration has not yet been triggered.
     * @return totalSupply_  Total supply from `ERC20Storage`, without legacy fallback.
     */
    function getNewTotalSuppl() internal view returns (uint256 totalSupply_) {
        totalSupply_ = erc20Storage().totalSupply;
    }

    /**
     * @notice Returns the balance of an account directly from the ERC20 storage slot,
     *         bypassing the legacy ERC1410 fallback.
     * @dev    Intended for use in contexts where the caller has already confirmed that
     *         migration has occurred for the account, or where only the post-migration
     *         value is relevant. Returns `0` if migration has not yet been triggered for
     *         the account.
     * @param _tokenHolder  Address to query.
     * @return balance_     Balance from `ERC20Storage` for `_tokenHolder`, without legacy
     *                      fallback.
     */
    function getNewBalanceOf(address _tokenHolder) internal view returns (uint256 balance_) {
        balance_ = erc20Storage().balances[_tokenHolder];
    }

    /**
     * @notice Returns the raw stored allowance for an owner–spender pair without applying
     *         ABAF adjustment.
     * @dev    Returns the value as stored in `ERC20Storage.allowed`. The returned value
     *         may not reflect the current effective allowance if ABAF has changed since
     *         the allowance was last written. Use `allowanceAdjustedAt` for an
     *         ABAF-adjusted view at a specific timestamp.
     * @param owner    Address that granted the allowance.
     * @param spender  Address of the spender.
     * @return Raw stored allowance from `ERC20Storage`.
     */
    function allowance(address owner, address spender) internal view returns (uint256) {
        return erc20Storage().allowed[owner][spender];
    }

    /**
     * @notice Returns the stored token name.
     * @return Token name string from `ERC20Storage`.
     */
    function getName() internal view returns (string memory) {
        return erc20Storage().name;
    }

    /**
     * @notice Returns the stored token symbol.
     * @return Token symbol string from `ERC20Storage`.
     */
    function symbol() internal view returns (string memory) {
        return erc20Storage().symbol;
    }

    /**
     * @notice Returns the current stored decimal precision of the token.
     * @dev    Reflects any increments applied by `adjustDecimals`; does not include
     *         pending scheduled decimal adjustments. Use `decimalsAdjustedAt` for a
     *         timestamp-adjusted view.
     * @return Current token decimal precision from `ERC20Storage`.
     */
    function decimals() internal view returns (uint8) {
        return erc20Storage().decimals;
    }

    /**
     * @notice Returns whether the ERC20 subsystem has been initialised.
     * @dev    Returns `false` until `initializeERC20` has been called. A `false` return
     *         indicates that token metadata fields are unpopulated.
     * @return True if `initializeERC20` has been called at least once; false otherwise.
     */
    function isERC20Initialized() internal view returns (bool) {
        return erc20Storage().initialized;
    }

    /**
     * @notice Returns the full ERC20 metadata struct as currently stored, without
     *         applying any pending scheduled adjustments.
     * @dev    Assembles `ERC20MetadataInfo` and `ERC20Metadata` from storage in a single
     *         read. For a timestamp-adjusted view including pending decimal changes, use
     *         `getERC20MetadataAdjustedAt`.
     * @return erc20Metadata_  Struct containing name, symbol, ISIN, decimals, and
     *                         security type as currently stored.
     */
    function getERC20Metadata() internal view returns (IERC20.ERC20Metadata memory erc20Metadata_) {
        ERC20Storage storage erc20Stor = erc20Storage();
        IERC20.ERC20MetadataInfo memory erc20Info = IERC20.ERC20MetadataInfo({
            name: erc20Stor.name,
            symbol: erc20Stor.symbol,
            isin: erc20Stor.isin,
            decimals: erc20Stor.decimals
        });
        erc20Metadata_ = IERC20.ERC20Metadata({ info: erc20Info, securityType: erc20Stor.securityType });
    }

    /**
     * @notice Returns the ERC20 metadata as it will appear at a given timestamp,
     *         incorporating any pending scheduled decimal adjustments due by that time.
     * @dev    Calls `ScheduledTasksStorageWrapper.getPendingScheduledBalanceAdjustmentsAt`
     *         to retrieve the pending decimal delta up to `timestamp`, then adds it to the
     *         stored decimal precision. Other metadata fields are returned as stored.
     * @param timestamp  Unix timestamp used to determine which scheduled decimal
     *                   adjustments are visible.
     * @return erc20Metadata_  Metadata struct with `decimals` adjusted for pending
     *                         scheduled changes at `timestamp`.
     */
    function getERC20MetadataAdjustedAt(
        uint256 timestamp
    ) internal view returns (IERC20.ERC20Metadata memory erc20Metadata_) {
        (, uint8 pendingDecimals) = ScheduledTasksStorageWrapper.getPendingScheduledBalanceAdjustmentsAt(timestamp);
        erc20Metadata_ = getERC20Metadata();
        erc20Metadata_.info.decimals += pendingDecimals;
    }

    /**
     * @notice Returns the effective decimal precision of the token at a given timestamp,
     *         incorporating any pending scheduled decimal adjustments due by that time.
     * @dev    Convenience accessor that delegates to `getERC20MetadataAdjustedAt` and
     *         extracts only the `decimals` field.
     * @param timestamp  Unix timestamp used to determine which scheduled decimal
     *                   adjustments are visible.
     * @return Effective decimal precision at `timestamp`.
     */
    function decimalsAdjustedAt(uint256 timestamp) internal view returns (uint8) {
        return getERC20MetadataAdjustedAt(timestamp).info.decimals;
    }

    /**
     * @notice Returns the effective allowance for an owner–spender pair at a given
     *         timestamp, scaled by the ratio of the ABAF at that timestamp to the stored
     *         allowance LABAF.
     * @dev    Reads the raw stored allowance and multiplies it by
     *         `calculateFactor(abafAt(timestamp), labaf)`. Does not mutate storage; the
     *         result is a read-only projection. If ABAF at `timestamp` equals the stored
     *         LABAF, the factor is `1` and the raw allowance is returned unchanged.
     * @param owner      Address that granted the allowance.
     * @param spender    Address of the spender.
     * @param timestamp  Unix timestamp at which to evaluate the ABAF adjustment.
     * @return ABAF-adjusted allowance for the owner–spender pair at `timestamp`.
     */
    function allowanceAdjustedAt(address owner, address spender, uint256 timestamp) internal view returns (uint256) {
        return
            allowance(owner, spender) *
            AdjustBalancesStorageWrapper.calculateFactor(
                AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp),
                AdjustBalancesStorageWrapper.getAllowanceLabaf(owner, spender)
            );
    }

    /**
     * @notice Returns the Diamond Storage pointer for `ERC20Storage`.
     * @dev    Uses inline assembly to position the struct at the deterministic slot
     *         defined by `_ERC20_STORAGE_POSITION`, following the ERC-2535 Diamond
     *         Storage Pattern. Slot isolation prevents collisions with other facet storage
     *         structs in the same proxy. Must only be called from within this library.
     * @return erc20Storage_  Storage pointer to the `ERC20Storage` struct.
     */
    function erc20Storage() private pure returns (ERC20Storage storage erc20Storage_) {
        bytes32 position = _ERC20_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc20Storage_.slot := position
        }
    }
}
