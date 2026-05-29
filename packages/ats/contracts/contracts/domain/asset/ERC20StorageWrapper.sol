// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _DEFAULT_PARTITION, KPI_ERC20_APPROVE_OWNER } from "../../constants/values.sol";
import { ICore } from "../../facets/core/ICore.sol";
import { IFactory } from "../../factory/IFactory.sol";
import { ITransfer } from "../../facets/transfer/ITransfer.sol";
import { IAllowanceTypes } from "../../facets/allowance/IAllowanceTypes.sol";
import { IERC1410Types } from "../../facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";

/// @custom:hash storage Erc20
bytes32 constant STORAGE_LOCATION_ERC20 = 0xba2beddc557de36eb4836f4ff1fd9d33a28d780fce70d36cf80b490142788200;

/**
 * @title ERC20Storage
 * @notice Backing storage for the ERC-20 metadata, balances, and allowances of an asset.
 * @dev Sole source of truth for name, symbol, ISIN, decimals, security type, total
 *      supply, per-holder balances, and per-spender allowances; mutated only via
 *      `ERC20StorageWrapper` against the deterministic ERC-7201 slot.
 * @custom:storage-location erc7201:security.token.standard.storage.Erc20
 */
struct ERC20Storage {
    // ─── R1 Packed scalars (uint8, bytes3, address, enum) ────
    uint8 decimals;
    IFactory.SecurityType securityType;
    // ─── R2 Single-slot scalars (uint256, bytes32, string) ───
    string name;
    string symbol;
    string isin;
    uint256 totalSupply;
    // ─── R3 Aggregates (mapping, array, EnumerableSet) ───────
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
     * @dev Writes name, symbol, ISIN, decimals, and security type from `erc20Metadata`
     *      then sets `initialized` to `true`. One-shot guarantee is enforced by the
     *      caller via `onlyNotERC20Initialized`.
     * @param erc20Metadata The metadata struct containing token info and security type.
     */
    function initializeERC20(ICore.ERC20Metadata calldata erc20Metadata) internal {
        ERC20Storage storage erc20Stor = erc20Storage();
        erc20Stor.name = erc20Metadata.info.name;
        erc20Stor.symbol = erc20Metadata.info.symbol;
        erc20Stor.isin = erc20Metadata.info.isin;
        erc20Stor.decimals = erc20Metadata.info.decimals;
        erc20Stor.securityType = erc20Metadata.securityType;
    }

    /**
     * @notice Overwrites the token name in the ERC-20 storage slot.
     * @param _name The new token name to store.
     */
    function setName(string calldata _name) internal {
        erc20Storage().name = _name;
    }

    /**
     * @notice Overwrites the token symbol in the ERC-20 storage slot.
     * @param _symbol The new token symbol to store.
     */
    function setSymbol(string calldata _symbol) internal {
        erc20Storage().symbol = _symbol;
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
            erc20Storage().balances[to] += value;
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
            erc20Storage().balances[from] -= value;
        }
    }

    /**
     * @notice Adds `value` to the token total supply.
     * @dev Uses `unchecked` arithmetic; the caller must guarantee no overflow.
     * @param value Amount to add to the total supply.
     */
    function increaseTotalSupply(uint256 value) internal {
        unchecked {
            erc20Storage().totalSupply += value;
        }
    }

    /**
     * @notice Subtracts `value` from the token total supply.
     * @dev Uses `unchecked` arithmetic; the caller must guarantee no underflow.
     * @param value Amount to subtract from the total supply.
     */
    function reduceTotalSupply(uint256 value) internal {
        unchecked {
            erc20Storage().totalSupply -= value;
        }
    }

    /**
     * @notice Multiplies the total supply by `factor` in-place.
     * @dev Used during balance-adjustment operations to keep total supply
     *      consistent with per-holder balance changes.
     * @param factor Multiplier to apply to the current total supply.
     */
    function adjustTotalSupply(uint256 factor) internal {
        erc20Storage().totalSupply *= factor;
    }

    /**
     * @notice Adds `adjustedDecimals` to the stored decimal count.
     * @dev Accumulates pending decimal adjustments originating from scheduled
     *      balance-adjustment tasks.
     * @param adjustedDecimals Number of decimal places to add.
     */
    function adjustDecimals(uint8 adjustedDecimals) internal {
        erc20Storage().decimals += adjustedDecimals;
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
        uint256 oldBalance = erc20Storage().balances[account];
        uint256 newBalance = oldBalance *
            AdjustBalancesStorageWrapper.calculateFactorByAbafAndTokenHolder(abaf, account);
        if (newBalance != oldBalance) {
            erc20Storage().balances[account] = newBalance;
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
        ERC1410StorageWrapper.triggerAndSyncAll(_DEFAULT_PARTITION, owner, address(0));
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
        uint256 abaf = AdjustBalancesStorageWrapper.getAbaf();
        uint256 labaf = AdjustBalancesStorageWrapper.getAllowanceLabaf(owner, spender);

        if (abaf == labaf) return;

        erc20Storage().allowed[owner][spender] *= AdjustBalancesStorageWrapper.calculateFactor(abaf, labaf);
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
     * @return `true` unconditionally on success; reverts on failure.
     */
    function approve(address owner, address spender, uint256 value) internal returns (bool) {
        _checkUnexpectedError(owner == address(0), KPI_ERC20_APPROVE_OWNER);

        if (spender == address(0)) {
            revert IAllowanceTypes.SpenderWithZeroAddress();
        }

        ERC1410StorageWrapper.triggerAndSyncAll(_DEFAULT_PARTITION, owner, spender);
        erc20Storage().allowed[owner][spender] = value;
        AdjustBalancesStorageWrapper.updateAllowanceLabaf(owner, spender, AdjustBalancesStorageWrapper.getAbaf());
        emit IAllowanceTypes.Approval(owner, spender, value);
        return true;
    }

    /**
     * @notice Increases the ERC-20 allowance of `spender` for `msg.sender` by
     *         `addedValue`.
     * @dev Reverts with `SpenderWithZeroAddress` if `spender` is the zero address.
     *      Delegates to `increaseAllowedBalance` which synchronises ABAF state and
     *      emits an `Approval` event.
     * @param spender    Address whose allowance is increased.
     * @param addedValue Amount to add to the existing allowance.
     * @return `true` unconditionally on success; reverts on failure.
     */
    function increaseAllowance(address spender, uint256 addedValue) internal returns (bool) {
        if (spender == address(0)) {
            revert IAllowanceTypes.SpenderWithZeroAddress();
        }

        increaseAllowedBalance(EvmAccessors.getMsgSender(), spender, addedValue);

        return true;
    }

    /**
     * @notice Decreases the ERC-20 allowance of `spender` for `msg.sender` by
     *         `subtractedValue` and emits an `Approval` event.
     * @dev Reverts with `SpenderWithZeroAddress` if `spender` is the zero address.
     *      Synchronises ABAF state via `beforeAllowanceUpdate` before reducing the
     *      allowance. Reverts via `decreaseAllowedBalance` if allowance is insufficient.
     * @param spender         Address whose allowance is decreased.
     * @param subtractedValue Amount to subtract from the existing allowance.
     * @return `true` unconditionally on success; reverts on failure.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) internal returns (bool) {
        if (spender == address(0)) {
            revert IAllowanceTypes.SpenderWithZeroAddress();
        }
        decreaseAllowedBalance(EvmAccessors.getMsgSender(), spender, subtractedValue);
        emit IAllowanceTypes.Approval(
            EvmAccessors.getMsgSender(),
            spender,
            erc20Storage().allowed[EvmAccessors.getMsgSender()][spender]
        );
        return true;
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
     * @return `true` unconditionally on success; reverts on failure.
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
     * @return `true` unconditionally on success; reverts on failure.
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
        return true;
    }

    /**
     * @notice Issues `value` tokens to `to` on the default partition.
     * @dev Delegates to `ERC1410StorageWrapper.issueByPartition`.
     * @param to    Recipient of the minted tokens.
     * @param value Amount of tokens to mint.
     */
    function mint(address to, uint256 value) internal {
        ERC1410StorageWrapper.issueByPartition(IERC1410Types.IssueData(_DEFAULT_PARTITION, to, value, ""));
    }

    /**
     * @notice Redeems `value` tokens from `from` on the default partition.
     * @dev Delegates to `ERC1410StorageWrapper.redeemByPartition`.
     * @param from  Account whose tokens are burned.
     * @param value Amount of tokens to burn.
     */
    function burn(address from, uint256 value) internal {
        ERC1410StorageWrapper.redeemByPartition(_DEFAULT_PARTITION, from, address(0), value, "", "");
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
     * @notice Reduces the allowance of `spender` on `from`'s balance by `value`,
     *         reverting if the existing allowance is insufficient.
     * @dev Calls `beforeAllowanceUpdate` first to synchronise ABAF state.
     *      Reverts with `InsufficientAllowance` when `value` exceeds the current
     *      allowance.
     * @param from    Token owner whose allowance is consumed.
     * @param spender Address whose spending limit is reduced.
     * @param value   Amount to deduct from the allowance.
     */
    function decreaseAllowedBalance(address from, address spender, uint256 value) internal {
        beforeAllowanceUpdate(from, spender);

        ERC20Storage storage erc20Stor = erc20Storage();

        if (value > erc20Stor.allowed[from][spender]) {
            revert IAllowanceTypes.InsufficientAllowance(spender, from);
        }

        erc20Stor.allowed[from][spender] -= value;
    }

    /**
     * @notice Increases the allowance of `spender` on `from`'s balance by `value`
     *         and emits an `Approval` event.
     * @dev Calls `beforeAllowanceUpdate` first to synchronise ABAF state before
     *      adding `value` to the stored allowance.
     * @param from    Token owner granting the additional allowance.
     * @param spender Address whose spending limit is increased.
     * @param value   Amount to add to the allowance.
     */
    function increaseAllowedBalance(address from, address spender, uint256 value) internal {
        beforeAllowanceUpdate(from, spender);

        ERC20Storage storage erc20Stor = erc20Storage();

        erc20Stor.allowed[from][spender] += value;

        emit IAllowanceTypes.Approval(from, spender, erc20Storage().allowed[from][spender]);
    }

    /**
     * @notice Returns the current ERC-20 total supply.
     * @return The total number of tokens in circulation.
     */
    function totalSupply() internal view returns (uint256) {
        return erc20Storage().totalSupply;
    }

    /**
     * @notice Returns the ERC-20 balance of `tokenHolder`.
     * @param tokenHolder Address to query.
     * @return The token balance of `tokenHolder`.
     */
    function balanceOf(address tokenHolder) internal view returns (uint256) {
        return erc20Storage().balances[tokenHolder];
    }

    /**
     * @notice Returns the current ERC-20 allowance that `owner` has granted to
     *         `spender`.
     * @param owner   Address that granted the allowance.
     * @param spender Address permitted to spend on `owner`'s behalf.
     * @return The remaining allowance for `spender` on `owner`'s balance.
     */
    function allowance(address owner, address spender) internal view returns (uint256) {
        return erc20Storage().allowed[owner][spender];
    }

    /**
     * @notice Returns the stored token name.
     * @return The ERC-20 token name string.
     */
    function getName() internal view returns (string memory) {
        return erc20Storage().name;
    }

    /**
     * @notice Returns the number of decimal places used by the token.
     * @return The ERC-20 decimals value.
     */
    function decimals() internal view returns (uint8) {
        return erc20Storage().decimals;
    }

    /**
     * @notice Returns the full ERC-20 metadata struct including token info and security
     *         type.
     * @return erc20Metadata_ The packed `ICore.ERC20Metadata` value read from storage.
     */
    function getERC20Metadata() internal view returns (ICore.ERC20Metadata memory erc20Metadata_) {
        ERC20Storage storage erc20Stor = erc20Storage();
        ICore.ERC20MetadataInfo memory erc20Info = ICore.ERC20MetadataInfo({
            name: erc20Stor.name,
            symbol: erc20Stor.symbol,
            isin: erc20Stor.isin,
            decimals: erc20Stor.decimals
        });
        erc20Metadata_ = ICore.ERC20Metadata({ info: erc20Info, securityType: erc20Stor.securityType });
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
        (, uint8 pendingDecimals) = ScheduledTasksStorageWrapper.getPendingScheduledBalanceAdjustmentsAt(timestamp);
        erc20Metadata_ = getERC20Metadata();
        erc20Metadata_.info.decimals += pendingDecimals;
    }

    /**
     * @notice Returns the effective decimal count at `timestamp`, incorporating any
     *         pending decimal adjustment scheduled before that point.
     * @param timestamp Unix timestamp at which to project the decimal count.
     * @return The projected decimal count.
     */
    function decimalsAdjustedAt(uint256 timestamp) internal view returns (uint8) {
        return getERC20MetadataAdjustedAt(timestamp).info.decimals;
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
     * @return The projected allowance amount.
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
     * @notice Returns a storage pointer to the ERC-7201 namespaced `ERC20Storage` slot.
     * @dev Uses inline assembly to set the storage pointer to `STORAGE_LOCATION_ERC20`.
     *      All other functions in this library must obtain their storage reference
     *      through this accessor.
     * @return erc20Storage_ Storage pointer to the ERC-20 data slot.
     */
    function erc20Storage() internal pure returns (ERC20Storage storage erc20Storage_) {
        bytes32 position = STORAGE_LOCATION_ERC20;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc20Storage_.slot := position
        }
    }
}
