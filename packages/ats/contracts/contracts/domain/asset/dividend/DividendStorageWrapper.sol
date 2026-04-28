// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { DIVIDEND_CORPORATE_ACTION_TYPE, SNAPSHOT_RESULT_ID, SNAPSHOT_TASK_TYPE } from "../../../constants/values.sol";
import { IDividend } from "../../../facets/layer_2/dividend/IDividend.sol";
import { IDividendStorageWrapper } from "./IDividendStorageWrapper.sol";
import { VotingStorageWrapper } from "../voting/VotingStorageWrapper.sol";

abstract contract DividendStorageWrapper is IDividendStorageWrapper, VotingStorageWrapper {
    function _setDividend(
        IDividend.Dividend calldata _newDividend
    ) internal override returns (bytes32 corporateActionId_, uint256 dividendId_) {
        bytes memory data = abi.encode(_newDividend);

        (corporateActionId_, dividendId_) = _addCorporateAction(DIVIDEND_CORPORATE_ACTION_TYPE, data);

        _initDividend(corporateActionId_, data);

        emit DividendSet(
            corporateActionId_,
            dividendId_,
            _msgSender(),
            _newDividend.recordDate,
            _newDividend.executionDate,
            _newDividend.amount,
            _newDividend.amountDecimals
        );
    }

    function _cancelDividend(uint256 _dividendId) internal override returns (bool success_) {
        IDividend.RegisteredDividend memory registeredDividend;
        bytes32 corporateActionId;
        (registeredDividend, corporateActionId, ) = _getDividend(_dividendId);
        if (registeredDividend.dividend.executionDate <= _blockTimestamp()) {
            revert IDividendStorageWrapper.DividendAlreadyExecuted(corporateActionId, _dividendId);
        }
        _cancelCorporateAction(corporateActionId);
        success_ = true;
        emit DividendCancelled(_dividendId, _msgSender());
    }

    function _initDividend(bytes32 _actionId, bytes memory _data) internal override {
        if (_actionId == bytes32(0)) {
            revert IDividendStorageWrapper.DividendCreationFailed();
        }

        IDividend.Dividend memory newDividend = abi.decode(_data, (IDividend.Dividend));

        _addScheduledCrossOrderedTask(newDividend.recordDate, SNAPSHOT_TASK_TYPE);
        _addScheduledSnapshot(newDividend.recordDate, _actionId);
    }

    /**
     * @dev returns the properties and related snapshots (if any) of a dividend.
     *
     * @param _dividendID The dividend Id
     */
    function _getDividend(
        uint256 _dividendID
    )
        internal
        view
        override
        returns (IDividend.RegisteredDividend memory registeredDividend_, bytes32 corporateActionId_, bool isDisabled_)
    {
        corporateActionId_ = _getCorporateActionIdByTypeIndex(DIVIDEND_CORPORATE_ACTION_TYPE, _dividendID - 1);

        bytes memory data;
        (, , data, isDisabled_) = _getCorporateAction(corporateActionId_);

        assert(data.length > 0);
        (registeredDividend_.dividend) = abi.decode(data, (IDividend.Dividend));

        registeredDividend_.snapshotId = _getUintResultAt(corporateActionId_, SNAPSHOT_RESULT_ID);
    }

    /**
     * @dev returns the dividends for an account.
     *
     * @param _dividendID The dividend Id
     * @param _account The account
     */
    function _getDividendFor(
        uint256 _dividendID,
        address _account
    ) internal view override returns (IDividend.DividendFor memory dividendFor_) {
        (IDividend.RegisteredDividend memory registeredDividend, , bool isDisabled) = _getDividend(_dividendID);

        dividendFor_.amount = registeredDividend.dividend.amount;
        dividendFor_.amountDecimals = registeredDividend.dividend.amountDecimals;
        dividendFor_.recordDate = registeredDividend.dividend.recordDate;
        dividendFor_.executionDate = registeredDividend.dividend.executionDate;
        dividendFor_.isDisabled = isDisabled;

        (dividendFor_.tokenBalance, dividendFor_.decimals, dividendFor_.recordDateReached) = _getSnapshotTakenBalance(
            registeredDividend.dividend.recordDate,
            registeredDividend.snapshotId,
            _account
        );
    }

    function _getDividendAmountFor(
        uint256 _dividendID,
        address _account
    ) internal view override returns (IDividend.DividendAmountFor memory dividendAmountFor_) {
        IDividend.DividendFor memory dividendFor = _getDividendFor(_dividendID, _account);

        if (!dividendFor.recordDateReached) return dividendAmountFor_;

        dividendAmountFor_.recordDateReached = true;

        dividendAmountFor_.numerator = dividendFor.tokenBalance * dividendFor.amount;

        dividendAmountFor_.denominator = 10 ** (dividendFor.decimals + dividendFor.amountDecimals);
    }

    function _getDividendsCount() internal view override returns (uint256 dividendCount_) {
        return _getCorporateActionCountByType(DIVIDEND_CORPORATE_ACTION_TYPE);
    }

    function _getDividendHolders(
        uint256 _dividendID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view override returns (address[] memory holders_) {
        IDividend.RegisteredDividend memory registeredDividend;
        (registeredDividend, , ) = _getDividend(_dividendID);

        if (registeredDividend.dividend.recordDate >= _blockTimestamp()) return new address[](0);

        if (registeredDividend.snapshotId != 0)
            return _tokenHoldersAt(registeredDividend.snapshotId, _pageIndex, _pageLength);

        return _getTokenHolders(_pageIndex, _pageLength);
    }

    function _getTotalDividendHolders(uint256 _dividendID) internal view override returns (uint256) {
        IDividend.RegisteredDividend memory registeredDividend;
        (registeredDividend, , ) = _getDividend(_dividendID);

        if (registeredDividend.dividend.recordDate >= _blockTimestamp()) return 0;

        if (registeredDividend.snapshotId != 0) return _totalTokenHoldersAt(registeredDividend.snapshotId);

        return _getTotalTokenHolders();
    }
}
