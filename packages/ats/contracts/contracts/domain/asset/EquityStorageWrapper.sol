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
    function _equityStorage() internal pure returns (EquityDataStorage storage equityData_) {
        bytes32 position = _EQUITY_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            equityData_.slot := position
        }
    }

    // solhint-disable-next-line ordering
    function _storeEquityDetails(IEquity.EquityDetailsData memory equityDetailsData) internal {
        _equityStorage().votingRight = equityDetailsData.votingRight;
        _equityStorage().informationRight = equityDetailsData.informationRight;
        _equityStorage().liquidationRight = equityDetailsData.liquidationRight;
        _equityStorage().subscriptionRight = equityDetailsData.subscriptionRight;
        _equityStorage().conversionRight = equityDetailsData.conversionRight;
        _equityStorage().redemptionRight = equityDetailsData.redemptionRight;
        _equityStorage().putRight = equityDetailsData.putRight;
        _equityStorage().dividendRight = equityDetailsData.dividendRight;
        _equityStorage().currency = equityDetailsData.currency;
        _equityStorage().nominalValue = equityDetailsData.nominalValue;
        _equityStorage().nominalValueDecimals = equityDetailsData.nominalValueDecimals;
    }

    function _setDividends(
        IEquity.Dividend calldata newDividend
    ) internal returns (bytes32 corporateActionId_, uint256 dividendId_) {
        bytes memory data = abi.encode(newDividend);

        (corporateActionId_, dividendId_) = CorporateActionsStorageWrapper._addCorporateAction(
            DIVIDEND_CORPORATE_ACTION_TYPE,
            data
        );

        _initDividend(corporateActionId_, data);
    }

    function _initDividend(bytes32 actionId, bytes memory data) internal {
        if (actionId == bytes32(0)) {
            revert IEquityStorageWrapper.DividendCreationFailed();
        }

        IEquity.Dividend memory newDividend = abi.decode(data, (IEquity.Dividend));

        ScheduledTasksStorageWrapper._addScheduledCrossOrderedTask(newDividend.recordDate, SNAPSHOT_TASK_TYPE);
        ScheduledTasksStorageWrapper._addScheduledSnapshot(newDividend.recordDate, actionId);
    }

    function _setVoting(
        IEquity.Voting calldata newVoting
    ) internal returns (bytes32 corporateActionId_, uint256 voteID_) {
        bytes memory data = abi.encode(newVoting);

        (corporateActionId_, voteID_) = CorporateActionsStorageWrapper._addCorporateAction(
            VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
            data
        );

        _initVotingRights(corporateActionId_, data);
    }

    function _initVotingRights(bytes32 actionId, bytes memory data) internal {
        if (actionId == bytes32(0)) {
            revert IEquityStorageWrapper.VotingRightsCreationFailed();
        }

        IEquity.Voting memory newVoting = abi.decode(data, (IEquity.Voting));

        ScheduledTasksStorageWrapper._addScheduledCrossOrderedTask(newVoting.recordDate, SNAPSHOT_TASK_TYPE);
        ScheduledTasksStorageWrapper._addScheduledSnapshot(newVoting.recordDate, actionId);
    }

    function _setScheduledBalanceAdjustment(
        IEquity.ScheduledBalanceAdjustment calldata newBalanceAdjustment
    ) internal returns (bytes32 corporateActionId_, uint256 balanceAdjustmentID_) {
        bytes memory data = abi.encode(newBalanceAdjustment);

        (corporateActionId_, balanceAdjustmentID_) = CorporateActionsStorageWrapper._addCorporateAction(
            BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE,
            data
        );

        _initBalanceAdjustment(corporateActionId_, data);
    }

    function _initBalanceAdjustment(bytes32 actionId, bytes memory data) internal {
        if (actionId == bytes32(0)) {
            revert IEquityStorageWrapper.BalanceAdjustmentCreationFailed();
        }

        IEquity.ScheduledBalanceAdjustment memory newBalanceAdjustment = abi.decode(
            data,
            (IEquity.ScheduledBalanceAdjustment)
        );

        ScheduledTasksStorageWrapper._addScheduledCrossOrderedTask(
            newBalanceAdjustment.executionDate,
            BALANCE_ADJUSTMENT_TASK_TYPE
        );
        ScheduledTasksStorageWrapper._addScheduledBalanceAdjustment(newBalanceAdjustment.executionDate, actionId);
    }

    function _getEquityDetails() internal view returns (IEquity.EquityDetailsData memory equityDetails_) {
        equityDetails_ = IEquity.EquityDetailsData({
            votingRight: _equityStorage().votingRight,
            informationRight: _equityStorage().informationRight,
            liquidationRight: _equityStorage().liquidationRight,
            subscriptionRight: _equityStorage().subscriptionRight,
            conversionRight: _equityStorage().conversionRight,
            redemptionRight: _equityStorage().redemptionRight,
            putRight: _equityStorage().putRight,
            dividendRight: _equityStorage().dividendRight,
            currency: _equityStorage().currency,
            nominalValue: _equityStorage().nominalValue,
            nominalValueDecimals: _equityStorage().nominalValueDecimals
        });
    }

    /**
     * @dev returns the properties and related snapshots (if any) of a dividend.
     *
     * @param dividendID The dividend Id
     */
    function _getDividends(
        uint256 dividendID
    ) internal view returns (IEquity.RegisteredDividend memory registeredDividend_) {
        bytes32 actionId = CorporateActionsStorageWrapper._getCorporateActionIdByTypeIndex(
            DIVIDEND_CORPORATE_ACTION_TYPE,
            dividendID - 1
        );

        (, , bytes memory data) = CorporateActionsStorageWrapper._getCorporateAction(actionId);

        assert(data.length > 0);
        (registeredDividend_.dividend) = abi.decode(data, (IEquity.Dividend));

        registeredDividend_.snapshotId = CorporateActionsStorageWrapper._getUintResultAt(actionId, SNAPSHOT_RESULT_ID);
    }

    /**
     * @dev returns the properties and related snapshots (if any) of a dividend.
     *
     * @param dividendID The dividend Id
     * @param account The account
     */
    function _getDividendsFor(
        uint256 dividendID,
        address account
    ) internal view returns (IEquity.DividendFor memory dividendFor_) {
        IEquity.RegisteredDividend memory registeredDividend = _getDividends(dividendID);

        dividendFor_.amount = registeredDividend.dividend.amount;
        dividendFor_.amountDecimals = registeredDividend.dividend.amountDecimals;
        dividendFor_.recordDate = registeredDividend.dividend.recordDate;
        dividendFor_.executionDate = registeredDividend.dividend.executionDate;

        (
            dividendFor_.tokenBalance,
            dividendFor_.decimals,
            dividendFor_.recordDateReached
        ) = _getSnapshotBalanceForIfDateReached(
            registeredDividend.dividend.recordDate,
            registeredDividend.snapshotId,
            account
        );
    }

    function _getDividendAmountFor(
        uint256 dividendID,
        address account
    ) internal view returns (IEquity.DividendAmountFor memory dividendAmountFor_) {
        IEquity.DividendFor memory dividendFor = _getDividendsFor(dividendID, account);

        if (!dividendFor.recordDateReached) return dividendAmountFor_;

        dividendAmountFor_.recordDateReached = true;

        dividendAmountFor_.numerator = dividendFor.tokenBalance * dividendFor.amount;

        dividendAmountFor_.denominator = 10 ** (dividendFor.decimals + dividendFor.amountDecimals);
    }

    function _getDividendsCount() internal view returns (uint256 dividendCount_) {
        return CorporateActionsStorageWrapper._getCorporateActionCountByType(DIVIDEND_CORPORATE_ACTION_TYPE);
    }

    function _getDividendHolders(
        uint256 dividendID,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (address[] memory holders_) {
        IEquity.RegisteredDividend memory registeredDividend = _getDividends(dividendID);

        if (registeredDividend.dividend.recordDate >= block.timestamp) return new address[](0);

        if (registeredDividend.snapshotId != 0)
            return SnapshotsStorageWrapper._tokenHoldersAt(registeredDividend.snapshotId, pageIndex, pageLength);

        return ERC1410StorageWrapper._getTokenHolders(pageIndex, pageLength);
    }

    function _getTotalDividendHolders(uint256 dividendID) internal view returns (uint256) {
        IEquity.RegisteredDividend memory registeredDividend = _getDividends(dividendID);

        if (registeredDividend.dividend.recordDate >= block.timestamp) return 0;

        if (registeredDividend.snapshotId != 0)
            return SnapshotsStorageWrapper._totalTokenHoldersAt(registeredDividend.snapshotId);

        return ERC1410StorageWrapper._getTotalTokenHolders();
    }

    function _getVoting(uint256 voteID) internal view returns (IEquity.RegisteredVoting memory registeredVoting_) {
        bytes32 actionId = CorporateActionsStorageWrapper._getCorporateActionIdByTypeIndex(
            VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
            voteID - 1
        );

        (, , bytes memory data) = CorporateActionsStorageWrapper._getCorporateAction(actionId);

        assert(data.length > 0);
        (registeredVoting_.voting) = abi.decode(data, (IEquity.Voting));

        registeredVoting_.snapshotId = CorporateActionsStorageWrapper._getUintResultAt(actionId, SNAPSHOT_RESULT_ID);
    }

    /**
     * @dev returns the properties and related snapshots (if any) of a voting.
     *
     * @param voteID The vote Id
     * @param account The account
     */
    function _getVotingFor(
        uint256 voteID,
        address account
    ) internal view returns (IEquity.VotingFor memory votingFor_) {
        IEquity.RegisteredVoting memory registeredVoting = _getVoting(voteID);

        votingFor_.recordDate = registeredVoting.voting.recordDate;
        votingFor_.data = registeredVoting.voting.data;

        (
            votingFor_.tokenBalance,
            votingFor_.decimals,
            votingFor_.recordDateReached
        ) = _getSnapshotBalanceForIfDateReached(
            registeredVoting.voting.recordDate,
            registeredVoting.snapshotId,
            account
        );
    }

    function _getVotingCount() internal view returns (uint256 votingCount_) {
        return CorporateActionsStorageWrapper._getCorporateActionCountByType(VOTING_RIGHTS_CORPORATE_ACTION_TYPE);
    }

    function _getVotingHolders(
        uint256 voteID,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (address[] memory holders_) {
        IEquity.RegisteredVoting memory registeredVoting = _getVoting(voteID);

        if (registeredVoting.voting.recordDate >= block.timestamp) return new address[](0);

        if (registeredVoting.snapshotId != 0)
            return SnapshotsStorageWrapper._tokenHoldersAt(registeredVoting.snapshotId, pageIndex, pageLength);

        return ERC1410StorageWrapper._getTokenHolders(pageIndex, pageLength);
    }

    function _getTotalVotingHolders(uint256 voteID) internal view returns (uint256) {
        IEquity.RegisteredVoting memory registeredVoting = _getVoting(voteID);

        if (registeredVoting.voting.recordDate >= block.timestamp) return 0;

        if (registeredVoting.snapshotId != 0)
            return SnapshotsStorageWrapper._totalTokenHoldersAt(registeredVoting.snapshotId);

        return ERC1410StorageWrapper._getTotalTokenHolders();
    }

    function _getScheduledBalanceAdjustment(
        uint256 balanceAdjustmentID
    ) internal view returns (IEquity.ScheduledBalanceAdjustment memory balanceAdjustment_) {
        bytes32 actionId = CorporateActionsStorageWrapper._getCorporateActionIdByTypeIndex(
            BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE,
            balanceAdjustmentID - 1
        );

        (, , bytes memory data) = CorporateActionsStorageWrapper._getCorporateAction(actionId);

        assert(data.length > 0);
        (balanceAdjustment_) = abi.decode(data, (IEquity.ScheduledBalanceAdjustment));
    }

    function _getScheduledBalanceAdjustmentsCount() internal view returns (uint256 balanceAdjustmentCount_) {
        return CorporateActionsStorageWrapper._getCorporateActionCountByType(BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE);
    }

    function _getSnapshotBalanceForIfDateReached(
        uint256 date,
        uint256 snapshotId,
        address account
    ) internal view returns (uint256 balance_, uint8 decimals_, bool dateReached_) {
        if (date < block.timestamp) {
            dateReached_ = true;

            balance_ = (snapshotId != 0)
                ? SnapshotsStorageWrapper._getTotalBalanceOfAtSnapshot(snapshotId, account)
                : ERC3643StorageWrapper._getTotalBalanceForAdjustedAt(account, date);

            decimals_ = (snapshotId != 0)
                ? SnapshotsStorageWrapper._decimalsAtSnapshot(snapshotId)
                : ERC20StorageWrapper._decimalsAdjustedAt(date);
        }
    }
}
