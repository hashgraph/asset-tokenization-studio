// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable ordering

import { IEquityUSA } from "../interfaces/IEquityUSA.sol";
import { IEquity } from "../../assetCapabilities/interfaces/equity/IEquity.sol";
import { ISecurity } from "../interfaces/ISecurity.sol";
import { _CORPORATE_ACTION_ROLE } from "../../../constants/roles.sol";
import {
    DIVIDEND_CORPORATE_ACTION_TYPE,
    VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
    BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE,
    SNAPSHOT_RESULT_ID,
    SNAPSHOT_TASK_TYPE,
    BALANCE_ADJUSTMENT_TASK_TYPE
} from "../../../constants/values.sol";
import { RegulationData, AdditionalSecurityData } from "../constants/regulation.sol";
import { LibEquity } from "../../../lib/domain/LibEquity.sol";
import { LibSecurity } from "../../../lib/domain/LibSecurity.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibCorporateActions } from "../../../lib/core/LibCorporateActions.sol";
import { LibScheduledTasks } from "../../../lib/domain/LibScheduledTasks.sol";
import { LibSnapshots } from "../../../lib/domain/LibSnapshots.sol";
import { LibERC1410 } from "../../../lib/domain/LibERC1410.sol";
import { LibTotalBalance } from "../../../lib/orchestrator/LibTotalBalance.sol";
import { LibTimeTravel } from "../../../test/timeTravel/LibTimeTravel.sol";

abstract contract EquityUSA is IEquityUSA {
    error AlreadyInitialized();
    error WrongDates(uint256 firstDate, uint256 secondDate);
    error WrongTimestamp(uint256 timeStamp);
    error FactorIsZero();
    error WrongIndexForAction(uint256 index, bytes32 actionType);

    // ═══════════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════════

    // solhint-disable-next-line func-name-mixedcase, private-vars-leading-underscore
    function _initialize_equityUSA(
        EquityDetailsData calldata _equityDetailsData,
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) external override {
        if (LibEquity.isInitialized()) {
            revert AlreadyInitialized();
        }
        LibEquity.storeEquityDetails(_equityDetailsData);
        LibSecurity.initializeSecurity(_regulationData, _additionalSecurityData);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // DIVIDENDS
    // ═══════════════════════════════════════════════════════════════════════════════

    function setDividends(Dividend calldata _newDividend) external override returns (uint256 dividendID_) {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_CORPORATE_ACTION_ROLE);
        _checkDates(_newDividend.recordDate, _newDividend.executionDate);
        _checkTimestamp(_newDividend.recordDate);

        bytes memory data = abi.encode(_newDividend);
        bytes32 corporateActionID;
        (corporateActionID, dividendID_) = LibCorporateActions.addCorporateAction(DIVIDEND_CORPORATE_ACTION_TYPE, data);
        _initDividend(corporateActionID, data);

        emit IEquity.DividendSet(
            corporateActionID,
            dividendID_,
            msg.sender,
            _newDividend.recordDate,
            _newDividend.executionDate,
            _newDividend.amount,
            _newDividend.amountDecimals
        );
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // VOTING
    // ═══════════════════════════════════════════════════════════════════════════════

    function setVoting(Voting calldata _newVoting) external override returns (uint256 voteID_) {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_CORPORATE_ACTION_ROLE);
        _checkTimestamp(_newVoting.recordDate);

        bytes memory data = abi.encode(_newVoting);
        bytes32 corporateActionID;
        (corporateActionID, voteID_) = LibCorporateActions.addCorporateAction(
            VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
            data
        );
        _initVotingRights(corporateActionID, data);

        emit IEquity.VotingSet(corporateActionID, voteID_, msg.sender, _newVoting.recordDate, _newVoting.data);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // SCHEDULED BALANCE ADJUSTMENTS
    // ═══════════════════════════════════════════════════════════════════════════════

    function setScheduledBalanceAdjustment(
        ScheduledBalanceAdjustment calldata _newBalanceAdjustment
    ) external override returns (uint256 balanceAdjustmentID_) {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_CORPORATE_ACTION_ROLE);
        _checkTimestamp(_newBalanceAdjustment.executionDate);
        _checkFactor(_newBalanceAdjustment.factor);

        bytes memory data = abi.encode(_newBalanceAdjustment);
        bytes32 corporateActionID;
        (corporateActionID, balanceAdjustmentID_) = LibCorporateActions.addCorporateAction(
            BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE,
            data
        );
        _initBalanceAdjustment(corporateActionID, data);

        emit IEquity.ScheduledBalanceAdjustmentSet(
            corporateActionID,
            balanceAdjustmentID_,
            msg.sender,
            _newBalanceAdjustment.executionDate,
            _newBalanceAdjustment.factor,
            _newBalanceAdjustment.decimals
        );
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // GETTERS (EXTERNAL VIEW)
    // ═══════════════════════════════════════════════════════════════════════════════

    function getDividends(
        uint256 _dividendID
    ) external view override returns (RegisteredDividend memory registeredDividend_) {
        _checkMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, _dividendID - 1);
        return _getDividends(_dividendID);
    }

    function getDividendsFor(
        uint256 _dividendID,
        address _account
    ) external view override returns (DividendFor memory dividendFor_) {
        _checkMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, _dividendID - 1);
        return _getDividendsFor(_dividendID, _account);
    }

    function getDividendAmountFor(
        uint256 _dividendID,
        address _account
    ) external view override returns (DividendAmountFor memory dividendAmountFor_) {
        _checkMatchingActionType(DIVIDEND_CORPORATE_ACTION_TYPE, _dividendID - 1);
        return _getDividendAmountFor(_dividendID, _account);
    }

    function getDividendsCount() external view override returns (uint256) {
        return LibCorporateActions.getCorporateActionCountByType(DIVIDEND_CORPORATE_ACTION_TYPE);
    }

    function getDividendHolders(
        uint256 _dividendID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory holders_) {
        return _getDividendHolders(_dividendID, _pageIndex, _pageLength);
    }

    function getTotalDividendHolders(uint256 _dividendID) external view override returns (uint256) {
        return _getTotalDividendHolders(_dividendID);
    }

    function getVoting(uint256 _voteID) external view override returns (RegisteredVoting memory registeredVoting_) {
        _checkMatchingActionType(VOTING_RIGHTS_CORPORATE_ACTION_TYPE, _voteID - 1);
        return _getVoting(_voteID);
    }

    function getVotingFor(
        uint256 _voteID,
        address _account
    ) external view override returns (VotingFor memory votingFor_) {
        _checkMatchingActionType(VOTING_RIGHTS_CORPORATE_ACTION_TYPE, _voteID - 1);
        return _getVotingFor(_voteID, _account);
    }

    function getVotingCount() external view override returns (uint256) {
        return LibCorporateActions.getCorporateActionCountByType(VOTING_RIGHTS_CORPORATE_ACTION_TYPE);
    }

    function getVotingHolders(
        uint256 _voteID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory holders_) {
        return _getVotingHolders(_voteID, _pageIndex, _pageLength);
    }

    function getTotalVotingHolders(uint256 _voteID) external view override returns (uint256) {
        return _getTotalVotingHolders(_voteID);
    }

    function getScheduledBalanceAdjustment(
        uint256 _balanceAdjustmentID
    ) external view override returns (ScheduledBalanceAdjustment memory) {
        _checkMatchingActionType(BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE, _balanceAdjustmentID - 1);
        return _getScheduledBalanceAdjustment(_balanceAdjustmentID);
    }

    function getScheduledBalanceAdjustmentCount() external view override returns (uint256) {
        return LibCorporateActions.getCorporateActionCountByType(BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // SECURITY
    // ═══════════════════════════════════════════════════════════════════════════════

    function getSecurityHolders(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory holders_) {
        return LibERC1410.getTokenHolders(_pageIndex, _pageLength);
    }

    function getSecurityRegulationData() external pure override returns (ISecurity.SecurityRegulationData memory) {
        return LibSecurity.getSecurityRegulationData();
    }

    function getTotalSecurityHolders() external view override returns (uint256) {
        return LibERC1410.getTotalTokenHolders();
    }

    function getEquityDetails() external view override returns (EquityDetailsData memory) {
        return LibEquity.getEquityDetails();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL STATE-CHANGING FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function _initDividend(bytes32 _actionId, bytes memory _data) internal {
        if (_actionId == bytes32(0)) {
            revert IEquity.DividendCreationFailed();
        }

        IEquity.Dividend memory newDividend = abi.decode(_data, (IEquity.Dividend));

        LibScheduledTasks.addScheduledCrossOrderedTask(newDividend.recordDate, abi.encode(SNAPSHOT_TASK_TYPE));
        LibScheduledTasks.addScheduledSnapshot(newDividend.recordDate, abi.encode(_actionId));
    }

    function _initVotingRights(bytes32 _actionId, bytes memory _data) internal {
        if (_actionId == bytes32(0)) {
            revert IEquity.VotingRightsCreationFailed();
        }

        IEquity.Voting memory newVoting = abi.decode(_data, (IEquity.Voting));

        LibScheduledTasks.addScheduledCrossOrderedTask(newVoting.recordDate, abi.encode(SNAPSHOT_TASK_TYPE));
        LibScheduledTasks.addScheduledSnapshot(newVoting.recordDate, abi.encode(_actionId));
    }

    function _initBalanceAdjustment(bytes32 _actionId, bytes memory _data) internal {
        if (_actionId == bytes32(0)) {
            revert IEquity.BalanceAdjustmentCreationFailed();
        }

        IEquity.ScheduledBalanceAdjustment memory newBalanceAdjustment = abi.decode(
            _data,
            (IEquity.ScheduledBalanceAdjustment)
        );

        LibScheduledTasks.addScheduledCrossOrderedTask(
            newBalanceAdjustment.executionDate,
            abi.encode(BALANCE_ADJUSTMENT_TASK_TYPE)
        );
        LibScheduledTasks.addScheduledBalanceAdjustment(newBalanceAdjustment.executionDate, abi.encode(_actionId));
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function _getDividends(
        uint256 _dividendID
    ) internal view returns (IEquity.RegisteredDividend memory registeredDividend_) {
        bytes32 actionId = LibCorporateActions.getCorporateActionIdByTypeIndex(
            DIVIDEND_CORPORATE_ACTION_TYPE,
            _dividendID - 1
        );

        (, , bytes memory data) = LibCorporateActions.getCorporateAction(actionId);

        assert(data.length > 0);
        (registeredDividend_.dividend) = abi.decode(data, (IEquity.Dividend));

        registeredDividend_.snapshotId = LibCorporateActions.getUintResultAt(actionId, SNAPSHOT_RESULT_ID);
    }

    function _getDividendsFor(
        uint256 _dividendID,
        address _account
    ) internal view returns (IEquity.DividendFor memory dividendFor_) {
        IEquity.RegisteredDividend memory registeredDividend = _getDividends(_dividendID);

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
            _account
        );
    }

    function _getDividendAmountFor(
        uint256 _dividendID,
        address _account
    ) internal view returns (IEquity.DividendAmountFor memory dividendAmountFor_) {
        IEquity.DividendFor memory dividendFor = _getDividendsFor(_dividendID, _account);

        if (!dividendFor.recordDateReached) return dividendAmountFor_;

        dividendAmountFor_.recordDateReached = true;
        dividendAmountFor_.numerator = dividendFor.tokenBalance * dividendFor.amount;
        dividendAmountFor_.denominator = 10 ** (dividendFor.decimals + dividendFor.amountDecimals);
    }

    function _getDividendHolders(
        uint256 _dividendID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory holders_) {
        IEquity.RegisteredDividend memory registeredDividend = _getDividends(_dividendID);

        if (registeredDividend.dividend.recordDate >= LibTimeTravel.getBlockTimestamp()) return new address[](0);

        if (registeredDividend.snapshotId != 0)
            return LibSnapshots.tokenHoldersAt(registeredDividend.snapshotId, _pageIndex, _pageLength);

        return LibERC1410.getTokenHolders(_pageIndex, _pageLength);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL VOTING FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function _getVoting(uint256 _voteID) internal view returns (IEquity.RegisteredVoting memory registeredVoting_) {
        bytes32 actionId = LibCorporateActions.getCorporateActionIdByTypeIndex(
            VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
            _voteID - 1
        );

        (, , bytes memory data) = LibCorporateActions.getCorporateAction(actionId);

        assert(data.length > 0);
        (registeredVoting_.voting) = abi.decode(data, (IEquity.Voting));

        registeredVoting_.snapshotId = LibCorporateActions.getUintResultAt(actionId, SNAPSHOT_RESULT_ID);
    }

    function _getVotingFor(
        uint256 _voteID,
        address _account
    ) internal view returns (IEquity.VotingFor memory votingFor_) {
        IEquity.RegisteredVoting memory registeredVoting = _getVoting(_voteID);

        votingFor_.recordDate = registeredVoting.voting.recordDate;
        votingFor_.data = registeredVoting.voting.data;

        (
            votingFor_.tokenBalance,
            votingFor_.decimals,
            votingFor_.recordDateReached
        ) = _getSnapshotBalanceForIfDateReached(
            registeredVoting.voting.recordDate,
            registeredVoting.snapshotId,
            _account
        );
    }

    function _getVotingHolders(
        uint256 _voteID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory holders_) {
        IEquity.RegisteredVoting memory registeredVoting = _getVoting(_voteID);

        if (registeredVoting.voting.recordDate >= LibTimeTravel.getBlockTimestamp()) return new address[](0);

        if (registeredVoting.snapshotId != 0)
            return LibSnapshots.tokenHoldersAt(registeredVoting.snapshotId, _pageIndex, _pageLength);

        return LibERC1410.getTokenHolders(_pageIndex, _pageLength);
    }

    function _getTotalVotingHolders(uint256 _voteID) internal view returns (uint256) {
        IEquity.RegisteredVoting memory registeredVoting = _getVoting(_voteID);

        if (registeredVoting.voting.recordDate >= LibTimeTravel.getBlockTimestamp()) return 0;

        if (registeredVoting.snapshotId != 0) return LibSnapshots.totalTokenHoldersAt(registeredVoting.snapshotId);

        return LibERC1410.getTotalTokenHolders();
    }

    function _getScheduledBalanceAdjustment(
        uint256 _balanceAdjustmentID
    ) internal view returns (IEquity.ScheduledBalanceAdjustment memory balanceAdjustment_) {
        bytes32 actionId = LibCorporateActions.getCorporateActionIdByTypeIndex(
            BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE,
            _balanceAdjustmentID - 1
        );

        (, , bytes memory data) = LibCorporateActions.getCorporateAction(actionId);

        assert(data.length > 0);
        (balanceAdjustment_) = abi.decode(data, (IEquity.ScheduledBalanceAdjustment));
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function _getSnapshotBalanceForIfDateReached(
        uint256 _date,
        uint256 _snapshotId,
        address _account
    ) internal view returns (uint256 balance_, uint8 decimals_, bool dateReached_) {
        if (_date < LibTimeTravel.getBlockTimestamp()) {
            dateReached_ = true;

            balance_ = (_snapshotId != 0)
                ? LibSnapshots.totalBalanceOfAtSnapshot(_snapshotId, _account)
                : LibTotalBalance.getTotalBalanceForAdjustedAt(_account, _date);

            decimals_ = (_snapshotId != 0)
                ? LibSnapshots.decimalsAtSnapshot(_snapshotId, LibTimeTravel.getBlockTimestamp())
                : _decimalsAdjustedAt(_date);
        }
    }

    function _decimalsAdjustedAt(uint256 _timestamp) internal view returns (uint8) {
        return LibSnapshots.decimalsAdjustedAt(_timestamp);
    }

    function _checkTimestamp(uint256 _timestamp) internal view {
        if (_timestamp <= LibTimeTravel.getBlockTimestamp()) {
            revert WrongTimestamp(_timestamp);
        }
    }

    function _checkMatchingActionType(bytes32 _actionType, uint256 _index) internal view {
        if (LibCorporateActions.getCorporateActionCountByType(_actionType) <= _index) {
            revert WrongIndexForAction(_index, _actionType);
        }
    }

    function _getTotalDividendHolders(uint256 _dividendID) internal view returns (uint256) {
        IEquity.RegisteredDividend memory registeredDividend = _getDividends(_dividendID);

        if (registeredDividend.dividend.recordDate >= LibTimeTravel.getBlockTimestamp()) return 0;

        if (registeredDividend.snapshotId != 0) return LibSnapshots.totalTokenHoldersAt(registeredDividend.snapshotId);

        return LibERC1410.getTotalTokenHolders();
    }

    function _checkDates(uint256 _firstDate, uint256 _secondDate) internal pure {
        if (_secondDate < _firstDate) {
            revert WrongDates(_firstDate, _secondDate);
        }
    }

    function _checkFactor(uint256 _factor) internal pure {
        if (_factor == 0) {
            revert FactorIsZero();
        }
    }
}
