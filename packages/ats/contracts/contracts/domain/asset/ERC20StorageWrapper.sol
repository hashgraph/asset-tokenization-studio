// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC20_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { _DEFAULT_PARTITION, KPI_ERC20_APPROVE_OWNER } from "../../constants/values.sol";
import { ICore } from "../../facets/core/ICore.sol";
import { ITransfer } from "../../facets/transfer/ITransfer.sol";
import { IAllowanceTypes } from "../../facets/allowance/IAllowanceTypes.sol";
import { IERC1410Types } from "../../facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { IFactory } from "../../factory/IFactory.sol";
import { ERC1410BasicStorage, ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";

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

library ERC20StorageWrapper {
    function initializeERC20(ICore.ERC20Metadata calldata erc20Metadata) internal {
        ERC20Storage storage erc20Stor = erc20Storage();
        erc20Stor.name = erc20Metadata.info.name;
        erc20Stor.symbol = erc20Metadata.info.symbol;
        erc20Stor.isin = erc20Metadata.info.isin;
        erc20Stor.decimals = erc20Metadata.info.decimals;
        erc20Stor.securityType = erc20Metadata.securityType;
        erc20Stor.initialized = true;
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
                emit ITransfer.Transfer(address(0), address(0), newBalance - oldBalance);
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
        checkUnexpectedError(owner == address(0), KPI_ERC20_APPROVE_OWNER);

        if (spender == address(0)) {
            revert IAllowanceTypes.SpenderWithZeroAddress();
        }

        erc20Storage().allowed[owner][spender] = value;
        emit IAllowanceTypes.Approval(owner, spender, value);
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) internal returns (bool) {
        if (spender == address(0)) {
            revert IAllowanceTypes.SpenderWithZeroAddress();
        }

        increaseAllowedBalance(EvmAccessors.getMsgSender(), spender, addedValue);

        return true;
    }

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
        emit ITransfer.Transfer(from, to, value);
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
        emit ITransfer.Transfer(from, to, value);
        return true;
    }

    function mint(address to, uint256 value) internal {
        ERC1410StorageWrapper.issueByPartition(IERC1410Types.IssueData(_DEFAULT_PARTITION, to, value, ""));
        emit ITransfer.Transfer(address(0), to, value);
    }

    function burn(address from, uint256 value) internal {
        ERC1410StorageWrapper.redeemByPartition(_DEFAULT_PARTITION, from, address(0), value, "", "");
        emit ITransfer.Transfer(from, address(0), value);
    }

    function burnFrom(address account, uint256 value) internal {
        decreaseAllowedBalance(account, EvmAccessors.getMsgSender(), value);
        burn(account, value);
    }

    function decreaseAllowedBalance(address from, address spender, uint256 value) internal {
        beforeAllowanceUpdate(from, spender);

        ERC20Storage storage erc20Stor = erc20Storage();

        if (value > erc20Stor.allowed[from][spender]) {
            revert IAllowanceTypes.InsufficientAllowance(spender, from);
        }

        erc20Stor.allowed[from][spender] -= value;
    }

    function increaseAllowedBalance(address from, address spender, uint256 value) internal {
        beforeAllowanceUpdate(from, spender);

        ERC20Storage storage erc20Stor = erc20Storage();

        erc20Stor.allowed[from][spender] += value;

        emit IAllowanceTypes.Approval(from, spender, erc20Storage().allowed[from][spender]);
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

    function decimals() internal view returns (uint8) {
        return erc20Storage().decimals;
    }

    function isERC20Initialized() internal view returns (bool) {
        return erc20Storage().initialized;
    }

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

    function getERC20MetadataAdjustedAt(
        uint256 timestamp
    ) internal view returns (ICore.ERC20Metadata memory erc20Metadata_) {
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

    function erc20Storage() internal pure returns (ERC20Storage storage erc20Storage_) {
        bytes32 position = _ERC20_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc20Storage_.slot := position
        }
    }
}
