// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _EQUITY_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import {
    DIVIDEND_CORPORATE_ACTION_TYPE,
    VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
    BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE,
    SNAPSHOT_RESULT_ID,
    SNAPSHOT_TASK_TYPE,
    BALANCE_ADJUSTMENT_TASK_TYPE
} from "../../constants/values.sol";
import { IEquity } from "../../facets/layer_2/equity/IEquity.sol";
import { IEquityStorageWrapper } from "./equity/IEquityStorageWrapper.sol";
import { CorporateActionsStorageWrapper } from "../core/CorporateActionsStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

struct EquityDataStorage {
    bool votingRight;
    bool informationRight;
    bool liquidationRight;
    bool subscriptionRight;
    bool conversionRight;
    bool redemptionRight;
    bool putRight;
    IEquity.DividendType dividendRight;
    bytes3 currency;
    uint256 nominalValue;
    bool initialized;
    uint8 nominalValueDecimals;
}

library EquityStorageWrapper {
    function storeEquityDetails(IEquity.EquityDetailsData memory equityDetailsData) internal {
        equityStorage().votingRight = equityDetailsData.votingRight;
        equityStorage().informationRight = equityDetailsData.informationRight;
        equityStorage().liquidationRight = equityDetailsData.liquidationRight;
        equityStorage().subscriptionRight = equityDetailsData.subscriptionRight;
        equityStorage().conversionRight = equityDetailsData.conversionRight;
        equityStorage().redemptionRight = equityDetailsData.redemptionRight;
        equityStorage().putRight = equityDetailsData.putRight;
        equityStorage().dividendRight = equityDetailsData.dividendRight;
        equityStorage().currency = equityDetailsData.currency;
        equityStorage().nominalValue = equityDetailsData.nominalValue;
        equityStorage().nominalValueDecimals = equityDetailsData.nominalValueDecimals;
    }

    function setDividends(
        IEquity.Dividend calldata newDividend
    ) internal returns (bytes32 corporateActionId_, uint256 dividendId_) {
        bytes memory data = abi.encode(newDividend);

        (corporateActionId_, dividendId_) = CorporateActionsStorageWrapper.addCorporateAction(
            DIVIDEND_CORPORATE_ACTION_TYPE,
            data
        );

        initDividend(corporateActionId_, data);
    }

    function initDividend(bytes32 actionId, bytes memory data) internal {
        if (actionId == bytes32(0)) {
            revert IEquityStorageWrapper.DividendCreationFailed();
        }

        IEquity.Dividend memory newDividend = abi.decode(data, (IEquity.Dividend));

        ScheduledTasksStorageWrapper.addScheduledCrossOrderedTask(newDividend.recordDate, SNAPSHOT_TASK_TYPE);
        ScheduledTasksStorageWrapper.addScheduledSnapshot(newDividend.recordDate, actionId);
    }

    function setVoting(
        IEquity.Voting calldata newVoting
    ) internal returns (bytes32 corporateActionId_, uint256 voteID_) {
        bytes memory data = abi.encode(newVoting);

        (corporateActionId_, voteID_) = CorporateActionsStorageWrapper.addCorporateAction(
            VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
            data
        );

        initVotingRights(corporateActionId_, data);
    }

    function initVotingRights(bytes32 actionId, bytes memory data) internal {
        if (actionId == bytes32(0)) {
            revert IEquityStorageWrapper.VotingRightsCreationFailed();
        }

        IEquity.Voting memory newVoting = abi.decode(data, (IEquity.Voting));

        ScheduledTasksStorageWrapper.addScheduledCrossOrderedTask(newVoting.recordDate, SNAPSHOT_TASK_TYPE);
        ScheduledTasksStorageWrapper.addScheduledSnapshot(newVoting.recordDate, actionId);
    }

    function setScheduledBalanceAdjustment(
        IEquity.ScheduledBalanceAdjustment calldata newBalanceAdjustment
    ) internal returns (bytes32 corporateActionId_, uint256 balanceAdjustmentID_) {
        bytes memory data = abi.encode(newBalanceAdjustment);

        (corporateActionId_, balanceAdjustmentID_) = CorporateActionsStorageWrapper.addCorporateAction(
            BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE,
            data
        );

        initBalanceAdjustment(corporateActionId_, data);
    }

    function initBalanceAdjustment(bytes32 actionId, bytes memory data) internal {
        if (actionId == bytes32(0)) {
            revert IEquityStorageWrapper.BalanceAdjustmentCreationFailed();
        }

        IEquity.ScheduledBalanceAdjustment memory newBalanceAdjustment = abi.decode(
            data,
            (IEquity.ScheduledBalanceAdjustment)
        );

        ScheduledTasksStorageWrapper.addScheduledCrossOrderedTask(
            newBalanceAdjustment.executionDate,
            BALANCE_ADJUSTMENT_TASK_TYPE
        );
        ScheduledTasksStorageWrapper.addScheduledBalanceAdjustment(newBalanceAdjustment.executionDate, actionId);
    }

    function getEquityDetails() internal view returns (IEquity.EquityDetailsData memory equityDetails_) {
        equityDetails_ = IEquity.EquityDetailsData({
            votingRight: equityStorage().votingRight,
            informationRight: equityStorage().informationRight,
            liquidationRight: equityStorage().liquidationRight,
            subscriptionRight: equityStorage().subscriptionRight,
            conversionRight: equityStorage().conversionRight,
            redemptionRight: equityStorage().redemptionRight,
            putRight: equityStorage().putRight,
            dividendRight: equityStorage().dividendRight,
            currency: equityStorage().currency,
            nominalValue: equityStorage().nominalValue,
            nominalValueDecimals: equityStorage().nominalValueDecimals
        });
    }

    /**
     * @dev returns the properties and related snapshots (if any) of a dividend.
     *
     * @param dividendID The dividend Id
     */
    function getDividends(
        uint256 dividendID
    ) internal view returns (IEquity.RegisteredDividend memory registeredDividend_) {
        bytes32 actionId = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            DIVIDEND_CORPORATE_ACTION_TYPE,
            dividendID - 1
        );

        (, , bytes memory data) = CorporateActionsStorageWrapper.getCorporateAction(actionId);

        assert(data.length > 0);
        (registeredDividend_.dividend) = abi.decode(data, (IEquity.Dividend));

        registeredDividend_.snapshotId = CorporateActionsStorageWrapper.getUintResultAt(actionId, SNAPSHOT_RESULT_ID);
    }

    /**
     * @dev returns the properties and related snapshots (if any) of a dividend.
     *
     * @param dividendID The dividend Id
     * @param account The account
     */
    function getDividendsFor(
        uint256 dividendID,
        address account
    ) internal view returns (IEquity.DividendFor memory dividendFor_) {
        IEquity.RegisteredDividend memory registeredDividend = getDividends(dividendID);

        dividendFor_.amount = registeredDividend.dividend.amount;
        dividendFor_.amountDecimals = registeredDividend.dividend.amountDecimals;
        dividendFor_.recordDate = registeredDividend.dividend.recordDate;
        dividendFor_.executionDate = registeredDividend.dividend.executionDate;

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
        uint256 dividendID,
        address account
    ) internal view returns (IEquity.DividendAmountFor memory dividendAmountFor_) {
        IEquity.DividendFor memory dividendFor = getDividendsFor(dividendID, account);

        if (!dividendFor.recordDateReached) return dividendAmountFor_;

        dividendAmountFor_.recordDateReached = true;

        dividendAmountFor_.numerator = dividendFor.tokenBalance * dividendFor.amount;

        dividendAmountFor_.denominator = 10 ** (dividendFor.decimals + dividendFor.amountDecimals);
    }

    function getDividendsCount() internal view returns (uint256 dividendCount_) {
        return CorporateActionsStorageWrapper.getCorporateActionCountByType(DIVIDEND_CORPORATE_ACTION_TYPE);
    }

    function getDividendHolders(
        uint256 dividendID,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (address[] memory holders_) {
        IEquity.RegisteredDividend memory registeredDividend = getDividends(dividendID);

        if (registeredDividend.dividend.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp())
            return new address[](0);

        if (registeredDividend.snapshotId != 0)
            return SnapshotsStorageWrapper.tokenHoldersAt(registeredDividend.snapshotId, pageIndex, pageLength);

        return ERC1410StorageWrapper.getTokenHolders(pageIndex, pageLength);
    }

    function getTotalDividendHolders(uint256 dividendID) internal view returns (uint256) {
        IEquity.RegisteredDividend memory registeredDividend = getDividends(dividendID);

        if (registeredDividend.dividend.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp()) return 0;

        if (registeredDividend.snapshotId != 0)
            return SnapshotsStorageWrapper.totalTokenHoldersAt(registeredDividend.snapshotId);

        return ERC1410StorageWrapper.getTotalTokenHolders();
    }

    function getVoting(uint256 voteID) internal view returns (IEquity.RegisteredVoting memory registeredVoting_) {
        bytes32 actionId = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
            voteID - 1
        );

        (, , bytes memory data) = CorporateActionsStorageWrapper.getCorporateAction(actionId);

        assert(data.length > 0);
        (registeredVoting_.voting) = abi.decode(data, (IEquity.Voting));

        registeredVoting_.snapshotId = CorporateActionsStorageWrapper.getUintResultAt(actionId, SNAPSHOT_RESULT_ID);
    }

    /**
     * @dev returns the properties and related snapshots (if any) of a voting.
     *
     * @param voteID The vote Id
     * @param account The account
     */
    function getVotingFor(uint256 voteID, address account) internal view returns (IEquity.VotingFor memory votingFor_) {
        IEquity.RegisteredVoting memory registeredVoting = getVoting(voteID);

        votingFor_.recordDate = registeredVoting.voting.recordDate;
        votingFor_.data = registeredVoting.voting.data;

        (
            votingFor_.tokenBalance,
            votingFor_.decimals,
            votingFor_.recordDateReached
        ) = getSnapshotBalanceForIfDateReached(
            registeredVoting.voting.recordDate,
            registeredVoting.snapshotId,
            account
        );
    }

    function getVotingCount() internal view returns (uint256 votingCount_) {
        return CorporateActionsStorageWrapper.getCorporateActionCountByType(VOTING_RIGHTS_CORPORATE_ACTION_TYPE);
    }

    function getVotingHolders(
        uint256 voteID,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (address[] memory holders_) {
        IEquity.RegisteredVoting memory registeredVoting = getVoting(voteID);

        if (registeredVoting.voting.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp()) return new address[](0);

        if (registeredVoting.snapshotId != 0)
            return SnapshotsStorageWrapper.tokenHoldersAt(registeredVoting.snapshotId, pageIndex, pageLength);

        return ERC1410StorageWrapper.getTokenHolders(pageIndex, pageLength);
    }

    function getTotalVotingHolders(uint256 voteID) internal view returns (uint256) {
        IEquity.RegisteredVoting memory registeredVoting = getVoting(voteID);

        if (registeredVoting.voting.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp()) return 0;

        if (registeredVoting.snapshotId != 0)
            return SnapshotsStorageWrapper.totalTokenHoldersAt(registeredVoting.snapshotId);

        return ERC1410StorageWrapper.getTotalTokenHolders();
    }

    function getScheduledBalanceAdjustment(
        uint256 balanceAdjustmentID
    ) internal view returns (IEquity.ScheduledBalanceAdjustment memory balanceAdjustment_) {
        bytes32 actionId = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE,
            balanceAdjustmentID - 1
        );

        (, , bytes memory data) = CorporateActionsStorageWrapper.getCorporateAction(actionId);

        assert(data.length > 0);
        (balanceAdjustment_) = abi.decode(data, (IEquity.ScheduledBalanceAdjustment));
    }

    function getScheduledBalanceAdjustmentsCount() internal view returns (uint256 balanceAdjustmentCount_) {
        return CorporateActionsStorageWrapper.getCorporateActionCountByType(BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE);
    }

    function getSnapshotBalanceForIfDateReached(
        uint256 date,
        uint256 snapshotId,
        address account
    ) internal view returns (uint256 balance_, uint8 decimals_, bool dateReached_) {
        if (date < TimeTravelStorageWrapper.getBlockTimestamp()) {
            dateReached_ = true;

            balance_ = (snapshotId != 0)
                ? SnapshotsStorageWrapper.getTotalBalanceOfAtSnapshot(snapshotId, account)
                : ERC3643StorageWrapper.getTotalBalanceForAdjustedAt(account, date);

            decimals_ = (snapshotId != 0)
                ? SnapshotsStorageWrapper.decimalsAtSnapshot(snapshotId)
                : ERC20StorageWrapper.decimalsAdjustedAt(date);
        }
    }

    function isEquityInitialized() internal view returns (bool) {
        return equityStorage().initialized;
    }

    // --- Pure functions (storage accessors) ---

    function equityStorage() internal pure returns (EquityDataStorage storage equityData_) {
        bytes32 position = _EQUITY_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            equityData_.slot := position
        }
    }
}
