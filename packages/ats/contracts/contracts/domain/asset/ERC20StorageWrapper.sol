// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC20_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { _DEFAULT_PARTITION, KPI_ERC20_APPROVE_OWNER } from "../../constants/values.sol";
import { IERC20 } from "../../facets/layer_1/ERC1400/ERC20/IERC20.sol";
// IERC20StorageWrapper is now merged into IERC20
import { IERC1410Types } from "../../facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { IFactory } from "../../factory/IFactory.sol";
import { ERC1410BasicStorage, ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";
import { InitBitmap } from "../init/InitBits.sol";

// Storage layout is tuned for slot packing:
//   slot 0: decimals + securityType (both small, packed)
//   slot 1: totalSupply
//   slot 2: initBitmap (UDVT = uint256 = full slot)
//   slot 3–5: name, symbol, isin (each string = own slot)
//   slot 6–7: balances, allowed (each mapping = own slot)
// Future appends go AFTER initBitmap and BEFORE strings to keep scalars together.
struct ERC20Storage {
    // Small scalars — packed into slot 0
    uint8 decimals;
    IFactory.SecurityType securityType;
    // Large primitives — one slot each
    uint256 totalSupply;
    InitBitmap initBitmap;
    // Strings — one slot each (break packing)
    string name;
    string symbol;
    string isin;
    // Mappings — one slot each
    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowed;
}

/// @title ERC20StorageWrapper
/// @notice Provides safe access to ERC20 storage (decimals, totalSupply, name, symbol, isin, balances, allowances)
/// @author Asset Tokenization Studio Team
library ERC20StorageWrapper {
    /**
     * @notice Writes ERC20 metadata (name, symbol, isin, decimals, securityType).
     * @param erc20Metadata The metadata struct containing name, symbol, isin, decimals, and securityType
     * @dev Callers gate the write with onlyNotErc20Initialized(<mask>) and flip the
     *      matching bits via markInitialized(<mask>) after the write.
     */
    function writeErc20Metadata(IERC20.ERC20Metadata calldata erc20Metadata) internal {
        ERC20Storage storage erc20Stor = erc20Storage();
        erc20Stor.name = erc20Metadata.info.name;
        erc20Stor.symbol = erc20Metadata.info.symbol;
        erc20Stor.isin = erc20Metadata.info.isin;
        erc20Stor.decimals = erc20Metadata.info.decimals;
        erc20Stor.securityType = erc20Metadata.securityType;
    }

    function increaseBalance(address to, uint256 value) internal {
        migrateBalanceIfNeeded(to);
        unchecked {
            erc20Storage().balances[to] += value;
        }
    }

    function reduceBalance(address from, uint256 value) internal {
        migrateBalanceIfNeeded(from);
        unchecked {
            erc20Storage().balances[from] -= value;
        }
    }

    function increaseTotalSupply(uint256 value) internal {
        migrateTotalSupplyIfNeeded();
        unchecked {
            erc20Storage().totalSupply += value;
        }
    }

    function reduceTotalSupply(uint256 value) internal {
        migrateTotalSupplyIfNeeded();
        unchecked {
            erc20Storage().totalSupply -= value;
        }
    }

    function adjustTotalSupply(uint256 factor) internal {
        migrateTotalSupplyIfNeeded();
        erc20Storage().totalSupply *= factor;
    }

    function adjustDecimals(uint8 adjustedDecimals) internal {
        erc20Storage().decimals += adjustedDecimals;
    }

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

    function beforeAllowanceUpdate(address owner, address spender) internal {
        ERC1410StorageWrapper.triggerAndSyncAll(_DEFAULT_PARTITION, owner, address(0));
        updateAllowanceAndLabaf(owner, spender);
    }

    function updateAllowanceAndLabaf(address owner, address spender) internal {
        uint256 abaf = AdjustBalancesStorageWrapper.getAbaf();
        uint256 labaf = AdjustBalancesStorageWrapper.getAllowanceLabaf(owner, spender);

        if (abaf == labaf) return;

        erc20Storage().allowed[owner][spender] *= AdjustBalancesStorageWrapper.calculateFactor(abaf, labaf);
        AdjustBalancesStorageWrapper.updateAllowanceLabaf(owner, spender, abaf);
    }

    function approve(address owner, address spender, uint256 value) internal returns (bool) {
        _checkUnexpectedError(owner == address(0), KPI_ERC20_APPROVE_OWNER);

        if (spender == address(0)) {
            revert IERC20.SpenderWithZeroAddress();
        }

        erc20Storage().allowed[owner][spender] = value;
        emit IERC20.Approval(owner, spender, value);
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) internal returns (bool) {
        if (spender == address(0)) {
            revert IERC20.SpenderWithZeroAddress();
        }

        increaseAllowedBalance(EvmAccessors.getMsgSender(), spender, addedValue);

        return true;
    }

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

    function mint(address to, uint256 value) internal {
        ERC1410StorageWrapper.issueByPartition(IERC1410Types.IssueData(_DEFAULT_PARTITION, to, value, ""));
        emit IERC20.Transfer(address(0), to, value);
    }

    function burn(address from, uint256 value) internal {
        ERC1410StorageWrapper.redeemByPartition(_DEFAULT_PARTITION, from, address(0), value, "", "");
        emit IERC20.Transfer(from, address(0), value);
    }

    function burnFrom(address account, uint256 value) internal {
        decreaseAllowedBalance(account, EvmAccessors.getMsgSender(), value);
        burn(account, value);
    }

    function decreaseAllowedBalance(address from, address spender, uint256 value) internal {
        beforeAllowanceUpdate(from, spender);

        ERC20Storage storage erc20Stor = erc20Storage();

        if (value > erc20Stor.allowed[from][spender]) {
            revert IERC20.InsufficientAllowance(spender, from);
        }

        erc20Stor.allowed[from][spender] -= value;
    }

    function increaseAllowedBalance(address from, address spender, uint256 value) internal {
        beforeAllowanceUpdate(from, spender);

        ERC20Storage storage erc20Stor = erc20Storage();

        erc20Stor.allowed[from][spender] += value;

        emit IERC20.Approval(from, spender, erc20Storage().allowed[from][spender]);
    }

    function migrateTotalSupplyIfNeeded() internal {
        ERC1410BasicStorage storage $ = ERC1410StorageWrapper.erc1410BasicStorage();
        if ($.DEPRECATED_totalSupply == 0) return;
        erc20Storage().totalSupply = $.DEPRECATED_totalSupply;
        $.DEPRECATED_totalSupply = 0;
    }

    function migrateBalanceIfNeeded(address tokenHolder) internal {
        ERC1410BasicStorage storage $ = ERC1410StorageWrapper.erc1410BasicStorage();
        if ($.DEPRECATED_balances[tokenHolder] == 0) return;
        erc20Storage().balances[tokenHolder] = $.DEPRECATED_balances[tokenHolder];
        $.DEPRECATED_balances[tokenHolder] = 0;
    }

    function markInitialized(uint256 bits) internal {
        ERC20Storage storage s = erc20Storage();
        s.initBitmap = s.initBitmap.markInitialized(bits);
    }

    function totalSupply() internal view returns (uint256 totalSupply_) {
        totalSupply_ = ERC1410StorageWrapper.erc1410BasicStorage().DEPRECATED_totalSupply;
        return totalSupply_ == 0 ? erc20Storage().totalSupply : totalSupply_;
    }

    function balanceOf(address tokenHolder) internal view returns (uint256 balance_) {
        balance_ = ERC1410StorageWrapper.erc1410BasicStorage().DEPRECATED_balances[tokenHolder];
        return balance_ == 0 ? erc20Storage().balances[tokenHolder] : balance_;
    }

    function allowance(address owner, address spender) internal view returns (uint256) {
        return erc20Storage().allowed[owner][spender];
    }

    function getName() internal view returns (string memory) {
        return erc20Storage().name;
    }

    function getSymbol() internal view returns (string memory) {
        return erc20Storage().symbol;
    }

    function decimals() internal view returns (uint8) {
        return erc20Storage().decimals;
    }

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

    function getERC20MetadataAdjustedAt(
        uint256 timestamp
    ) internal view returns (IERC20.ERC20Metadata memory erc20Metadata_) {
        (, uint8 pendingDecimals) = ScheduledTasksStorageWrapper.getPendingScheduledBalanceAdjustmentsAt(timestamp);
        erc20Metadata_ = getERC20Metadata();
        erc20Metadata_.info.decimals += pendingDecimals;
    }

    function decimalsAdjustedAt(uint256 timestamp) internal view returns (uint8) {
        return getERC20MetadataAdjustedAt(timestamp).info.decimals;
    }

    function allowanceAdjustedAt(address owner, address spender, uint256 timestamp) internal view returns (uint256) {
        return
            allowance(owner, spender) *
            AdjustBalancesStorageWrapper.calculateFactor(
                AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp),
                AdjustBalancesStorageWrapper.getAllowanceLabaf(owner, spender)
            );
    }

    function isInitialized(uint256 bits) internal view returns (bool) {
        return erc20Storage().initBitmap.isInitialized(bits);
    }

    function isAnyInitialized(uint256 bits) internal view returns (bool) {
        return erc20Storage().initBitmap.isAnyInitialized(bits);
    }

    function requireNotInitialized(uint256 bits) internal view {
        erc20Storage().initBitmap.requireNotInitialized(bits);
    }

    // TODO(least-privilege): downgrade to `private pure` once external callers
    // (ERC3643StorageWrapper.setName/setSymbol/setOnchainID and MigrationFacetTest)
    // route through named wrappers instead of reaching into ERC20Storage directly.
    // Isolation rule says storage-slot accessors belong to the owning wrapper only.
    function erc20Storage() internal pure returns (ERC20Storage storage erc20Storage_) {
        bytes32 position = _ERC20_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc20Storage_.slot := position
        }
    }
}
