// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _EQUITY_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import {
    DIVIDEND_CORPORATE_ACTION_TYPE,
    VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
    BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE,
    SNAPSHOT_RESULT_ID,
    SNAPSHOT_TASK_TYPE,
    BALANCE_ADJUSTMENT_TASK_TYPE,
    KPI_EQUITY_DIVIDEND_DATA,
    KPI_EQUITY_VOTING_DATA,
    KPI_EQUITY_BALANCE_ADJ
} from "../../constants/values.sol";
import { IEquity } from "../../facets/layer_2/equity/IEquity.sol";
import { CorporateActionsStorageWrapper } from "../core/CorporateActionsStorageWrapper.sol";
import { NominalValueStorageWrapper } from "./nominalValue/NominalValueStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";

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
    /// @deprecated Kept for storage layout compatibility. Use NominalValueStorageWrapper instead.
    // solhint-disable-next-line var-name-mixedcase
    uint256 DEPRECATED_nominalValue;
    bool initialized;
    /// @deprecated Kept for storage layout compatibility. Use NominalValueStorageWrapper instead.
    // solhint-disable-next-line var-name-mixedcase
    uint8 DEPRECATED_nominalValueDecimals;
}

/// @title Equity Storage Wrapper
/// @notice Library for managing Equity token storage operations.
/// @dev Provides structured access to EquityDataStorage with migration support for NominalValue.
library EquityStorageWrapper {
    function initializeEquityDetails(IEquity.EquityDetailsData memory equityDetailsData) internal {
        EquityDataStorage storage $ = _equityStorage();
        $.votingRight = equityDetailsData.votingRight;
        $.informationRight = equityDetailsData.informationRight;
        $.liquidationRight = equityDetailsData.liquidationRight;
        $.subscriptionRight = equityDetailsData.subscriptionRight;
        $.conversionRight = equityDetailsData.conversionRight;
        $.redemptionRight = equityDetailsData.redemptionRight;
        $.putRight = equityDetailsData.putRight;
        $.dividendRight = equityDetailsData.dividendRight;
        $.currency = equityDetailsData.currency;
        $.initialized = true;
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

    function cancelDividend(uint256 dividendId) internal returns (bool success_) {
        IEquity.RegisteredDividend memory registeredDividend;
        bytes32 corporateActionId;
        (registeredDividend, corporateActionId, ) = getDividends(dividendId);
        if (registeredDividend.dividend.executionDate <= TimeTravelStorageWrapper.getBlockTimestamp()) {
            revert IEquity.DividendAlreadyExecuted(corporateActionId, dividendId);
        }
        CorporateActionsStorageWrapper.cancelCorporateAction(corporateActionId);
        success_ = true;
    }

    function initDividend(bytes32 actionId, bytes memory data) internal {
        if (actionId == bytes32(0)) {
            revert IEquity.DividendCreationFailed();
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

    function cancelVoting(uint256 voteId) internal returns (bool success_) {
        IEquity.RegisteredVoting memory registeredVoting;
        bytes32 corporateActionId;
        (registeredVoting, corporateActionId, ) = getVoting(voteId);
        if (registeredVoting.voting.recordDate <= TimeTravelStorageWrapper.getBlockTimestamp()) {
            revert IEquity.VotingAlreadyRecorded(corporateActionId, voteId);
        }
        CorporateActionsStorageWrapper.cancelCorporateAction(corporateActionId);
        success_ = true;
    }

    function initVotingRights(bytes32 actionId, bytes memory data) internal {
        if (actionId == bytes32(0)) {
            revert IEquity.VotingRightsCreationFailed();
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

    function cancelScheduledBalanceAdjustment(uint256 balanceAdjustmentId) internal returns (bool success_) {
        IEquity.ScheduledBalanceAdjustment memory balanceAdjustment;
        bytes32 corporateActionId;
        (balanceAdjustment, corporateActionId, ) = getScheduledBalanceAdjustment(balanceAdjustmentId);
        if (balanceAdjustment.executionDate <= TimeTravelStorageWrapper.getBlockTimestamp()) {
            revert IEquity.BalanceAdjustmentAlreadyExecuted(corporateActionId, balanceAdjustmentId);
        }
        CorporateActionsStorageWrapper.cancelCorporateAction(corporateActionId);
        success_ = true;
    }

    function initBalanceAdjustment(bytes32 actionId, bytes memory data) internal {
        if (actionId == bytes32(0)) {
            revert IEquity.BalanceAdjustmentCreationFailed();
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

    /// @dev DEPRECATED – MIGRATION: Remove this function and the DEPRECATED_ fields from
    /// EquityDataStorage once all legacy tokens have been migrated.
    function clearNominalValue() internal {
        EquityDataStorage storage $ = _equityStorage();
        $.DEPRECATED_nominalValue = 0;
        $.DEPRECATED_nominalValueDecimals = 0;
    }

    // This is for testing only
    function setDeprecatedNominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals) internal {
        EquityDataStorage storage $ = _equityStorage();
        $.DEPRECATED_nominalValue = _nominalValue;
        $.DEPRECATED_nominalValueDecimals = _nominalValueDecimals;
    }

    function getDeprecatedNominalValue() internal view returns (uint256 nominalValue_) {
        nominalValue_ = _equityStorage().DEPRECATED_nominalValue;
    }

    function getDeprecatedNominalValueDecimals() internal view returns (uint8 nominalValueDecimals_) {
        nominalValueDecimals_ = _equityStorage().DEPRECATED_nominalValueDecimals;
    }

    function getEquityDetails() internal view returns (IEquity.EquityDetailsData memory equityDetails_) {
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
            nominalValue: NominalValueStorageWrapper._getNominalValue(),
            nominalValueDecimals: NominalValueStorageWrapper._getNominalValueDecimals()
        });
    }

    /**
     * @dev returns the properties and related snapshots (if any) of a dividend.
     *
     * @param dividendID The dividend Id
     */
    function getDividends(
        uint256 dividendID
    )
        internal
        view
        returns (IEquity.RegisteredDividend memory registeredDividend_, bytes32 corporateActionId_, bool isDisabled_)
    {
        corporateActionId_ = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            DIVIDEND_CORPORATE_ACTION_TYPE,
            dividendID - 1
        );

        bytes memory data;
        (, , data, isDisabled_) = CorporateActionsStorageWrapper.getCorporateAction(corporateActionId_);

        _checkUnexpectedError(data.length == 0, KPI_EQUITY_DIVIDEND_DATA);
        (registeredDividend_.dividend) = abi.decode(data, (IEquity.Dividend));

        registeredDividend_.snapshotId = CorporateActionsStorageWrapper.getUintResultAt(
            corporateActionId_,
            SNAPSHOT_RESULT_ID
        );
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
        (IEquity.RegisteredDividend memory registeredDividend, , ) = getDividends(dividendID);

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
        (IEquity.RegisteredDividend memory registeredDividend, , ) = getDividends(dividendID);

        if (registeredDividend.dividend.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp()) return holders_;

        if (registeredDividend.snapshotId != 0)
            return SnapshotsStorageWrapper.tokenHoldersAt(registeredDividend.snapshotId, pageIndex, pageLength);

        return ERC1410StorageWrapper.getTokenHolders(pageIndex, pageLength);
    }

    function getTotalDividendHolders(uint256 dividendID) internal view returns (uint256) {
        (IEquity.RegisteredDividend memory registeredDividend, , ) = getDividends(dividendID);

        if (registeredDividend.dividend.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp()) return 0;

        if (registeredDividend.snapshotId != 0)
            return SnapshotsStorageWrapper.totalTokenHoldersAt(registeredDividend.snapshotId);

        return ERC1410StorageWrapper.getTotalTokenHolders();
    }

    function getVoting(
        uint256 voteID
    )
        internal
        view
        returns (IEquity.RegisteredVoting memory registeredVoting_, bytes32 corporateActionId_, bool isDisabled_)
    {
        corporateActionId_ = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
            voteID - 1
        );

        bytes memory data;
        (, , data, isDisabled_) = CorporateActionsStorageWrapper.getCorporateAction(corporateActionId_);

        _checkUnexpectedError(data.length == 0, KPI_EQUITY_VOTING_DATA);
        (registeredVoting_.voting) = abi.decode(data, (IEquity.Voting));

        registeredVoting_.snapshotId = CorporateActionsStorageWrapper.getUintResultAt(
            corporateActionId_,
            SNAPSHOT_RESULT_ID
        );
    }

    /**
     * @dev returns the properties and related snapshots (if any) of a voting.
     *
     * @param voteID The vote Id
     * @param account The account
     */
    function getVotingFor(uint256 voteID, address account) internal view returns (IEquity.VotingFor memory votingFor_) {
        (IEquity.RegisteredVoting memory registeredVoting, , ) = getVoting(voteID);

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
        (IEquity.RegisteredVoting memory registeredVoting, , ) = getVoting(voteID);

        if (registeredVoting.voting.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp()) return holders_;

        if (registeredVoting.snapshotId != 0)
            return SnapshotsStorageWrapper.tokenHoldersAt(registeredVoting.snapshotId, pageIndex, pageLength);

        return ERC1410StorageWrapper.getTokenHolders(pageIndex, pageLength);
    }

    function getTotalVotingHolders(uint256 voteID) internal view returns (uint256) {
        (IEquity.RegisteredVoting memory registeredVoting, , ) = getVoting(voteID);

        if (registeredVoting.voting.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp()) return 0;

        if (registeredVoting.snapshotId != 0)
            return SnapshotsStorageWrapper.totalTokenHoldersAt(registeredVoting.snapshotId);

        return ERC1410StorageWrapper.getTotalTokenHolders();
    }

    function getScheduledBalanceAdjustment(
        uint256 balanceAdjustmentID
    )
        internal
        view
        returns (
            IEquity.ScheduledBalanceAdjustment memory balanceAdjustment_,
            bytes32 corporateActionId_,
            bool isDisabled_
        )
    {
        corporateActionId_ = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE,
            balanceAdjustmentID - 1
        );

        bytes memory data;
        (, , data, isDisabled_) = CorporateActionsStorageWrapper.getCorporateAction(corporateActionId_);

        _checkUnexpectedError(data.length == 0, KPI_EQUITY_BALANCE_ADJ);
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
        if (date >= TimeTravelStorageWrapper.getBlockTimestamp()) return (balance_, decimals_, dateReached_);
        dateReached_ = true;

        balance_ = (snapshotId != 0)
            ? SnapshotsStorageWrapper.getTotalBalanceOfAtSnapshot(snapshotId, account)
            : ERC3643StorageWrapper.getTotalBalanceForAdjustedAt(account, date);

        decimals_ = (snapshotId != 0)
            ? SnapshotsStorageWrapper.decimalsAtSnapshot(snapshotId)
            : ERC20StorageWrapper.decimalsAdjustedAt(date);
    }

    function isEquityInitialized() internal view returns (bool) {
        return _equityStorage().initialized;
    }

    function _equityStorage() private pure returns (EquityDataStorage storage equityData_) {
        bytes32 position = _EQUITY_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            equityData_.slot := position
        }
    }
}
