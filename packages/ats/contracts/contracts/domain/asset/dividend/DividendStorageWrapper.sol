// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { DIVIDEND_CORPORATE_ACTION_TYPE, SNAPSHOT_RESULT_ID, SNAPSHOT_TASK_TYPE } from "../../../constants/values.sol";
import { CorporateActionsStorageWrapper } from "../../core/CorporateActionsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "../ERC20StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../core/ERC3643StorageWrapper.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";
import { IDividend } from "../../../facets/layer_2/dividend/IDividend.sol";
import { IDividendTypes } from "../../../facets/layer_2/dividend/IDividendTypes.sol";
import { ScheduledTasksStorageWrapper } from "../ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../SnapshotsStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

library DividendStorageWrapper {
    function setDividend(
        IDividendTypes.Dividend calldata newDividend
    ) internal returns (bytes32 corporateActionId_, uint256 dividendId_) {
        bytes memory data = abi.encode(newDividend);

        (corporateActionId_, dividendId_) = CorporateActionsStorageWrapper.addCorporateAction(
            DIVIDEND_CORPORATE_ACTION_TYPE,
            data
        );

        initDividend(corporateActionId_, data);

        emit IDividend.DividendSet(
            corporateActionId_,
            dividendId_,
            EvmAccessors.getMsgSender(),
            newDividend.recordDate,
            newDividend.executionDate,
            newDividend.amount,
            newDividend.amountDecimals
        );
    }

    function cancelDividend(uint256 dividendId) internal returns (bool success_) {
        (IDividend.RegisteredDividend memory registeredDividend, bytes32 corporateActionId, ) = getDividend(dividendId);

        if (registeredDividend.dividend.executionDate <= TimeTravelStorageWrapper.getBlockTimestamp()) {
            revert IDividend.DividendAlreadyExecuted(corporateActionId, dividendId);
        }

        CorporateActionsStorageWrapper.cancelCorporateAction(corporateActionId);
        success_ = true;

        emit IDividend.DividendCancelled(dividendId, EvmAccessors.getMsgSender());
    }

    function initDividend(bytes32 actionId, bytes memory data) internal {
        if (actionId == bytes32(0)) {
            revert IDividend.DividendCreationFailed();
        }

        IDividendTypes.Dividend memory newDividend = abi.decode(data, (IDividendTypes.Dividend));

        ScheduledTasksStorageWrapper.addScheduledCrossOrderedTask(newDividend.recordDate, SNAPSHOT_TASK_TYPE);
        ScheduledTasksStorageWrapper.addScheduledSnapshot(newDividend.recordDate, actionId);
    }

    function getDividend(
        uint256 dividendId
    )
        internal
        view
        returns (IDividend.RegisteredDividend memory registeredDividend_, bytes32 corporateActionId_, bool isDisabled_)
    {
        corporateActionId_ = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            DIVIDEND_CORPORATE_ACTION_TYPE,
            dividendId - 1
        );

        bytes memory data;
        (, , data, isDisabled_) = CorporateActionsStorageWrapper.getCorporateAction(corporateActionId_);

        assert(data.length > 0);
        (registeredDividend_.dividend) = abi.decode(data, (IDividendTypes.Dividend));

        registeredDividend_.snapshotId = CorporateActionsStorageWrapper.getUintResultAt(
            corporateActionId_,
            SNAPSHOT_RESULT_ID
        );
    }

    function getDividendFor(
        uint256 dividendId,
        address account
    ) internal view returns (IDividendTypes.DividendFor memory dividendFor_) {
        (IDividend.RegisteredDividend memory registeredDividend, , bool isDisabled) = getDividend(dividendId);

        dividendFor_.amount = registeredDividend.dividend.amount;
        dividendFor_.amountDecimals = registeredDividend.dividend.amountDecimals;
        dividendFor_.recordDate = registeredDividend.dividend.recordDate;
        dividendFor_.executionDate = registeredDividend.dividend.executionDate;
        dividendFor_.isDisabled = isDisabled;

        (
            dividendFor_.tokenBalance,
            dividendFor_.decimals,
            dividendFor_.recordDateReached
        ) = getSnapshotBalanceForIfDateReached(
            registeredDividend.dividend.recordDate,
            registeredDividend.snapshotId,
            account
        );
    }

    function getDividendAmountFor(
        uint256 dividendId,
        address account
    ) internal view returns (IDividendTypes.DividendAmountFor memory dividendAmountFor_) {
        IDividendTypes.DividendFor memory dividendFor = getDividendFor(dividendId, account);

        if (!dividendFor.recordDateReached) return dividendAmountFor_;

        dividendAmountFor_.recordDateReached = true;

        dividendAmountFor_.numerator = dividendFor.tokenBalance * dividendFor.amount;

        dividendAmountFor_.denominator = 10 ** (dividendFor.decimals + dividendFor.amountDecimals);
    }

    function getDividendsCount() internal view returns (uint256 dividendCount_) {
        return CorporateActionsStorageWrapper.getCorporateActionCountByType(DIVIDEND_CORPORATE_ACTION_TYPE);
    }

    function getDividendHolders(
        uint256 dividendId,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (address[] memory holders_) {
        (IDividend.RegisteredDividend memory registeredDividend, , ) = getDividend(dividendId);

        if (registeredDividend.dividend.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp())
            return new address[](0);

        if (registeredDividend.snapshotId != 0)
            return SnapshotsStorageWrapper.tokenHoldersAt(registeredDividend.snapshotId, pageIndex, pageLength);

        return ERC1410StorageWrapper.getTokenHolders(pageIndex, pageLength);
    }

    function getTotalDividendHolders(uint256 dividendId) internal view returns (uint256) {
        (IDividend.RegisteredDividend memory registeredDividend, , ) = getDividend(dividendId);

        if (registeredDividend.dividend.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp()) return 0;

        if (registeredDividend.snapshotId != 0)
            return SnapshotsStorageWrapper.totalTokenHoldersAt(registeredDividend.snapshotId);

        return ERC1410StorageWrapper.getTotalTokenHolders();
    }

    function getSnapshotBalanceForIfDateReached(
        uint256 date,
        uint256 snapshotId,
        address account
    ) private view returns (uint256 balance_, uint8 decimals_, bool dateReached_) {
        if (date >= TimeTravelStorageWrapper.getBlockTimestamp()) return (balance_, decimals_, dateReached_);
        dateReached_ = true;

        balance_ = (snapshotId != 0)
            ? SnapshotsStorageWrapper.getTotalBalanceOfAtSnapshot(snapshotId, account)
            : ERC3643StorageWrapper.getTotalBalanceForAdjustedAt(account, date);

        decimals_ = (snapshotId != 0)
            ? SnapshotsStorageWrapper.decimalsAtSnapshot(snapshotId)
            : ERC20StorageWrapper.decimalsAdjustedAt(date);
    }
}
