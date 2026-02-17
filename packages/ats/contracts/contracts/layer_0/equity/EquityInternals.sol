// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondInternals } from "../bond/BondInternals.sol";
import { IEquity } from "../../layer_2/interfaces/equity/IEquity.sol";

abstract contract EquityInternals is BondInternals {
    function _initDividend(bytes32 _actionId, bytes memory _data) internal virtual;
    function _initVotingRights(bytes32 _actionId, bytes memory _data) internal virtual;
    function _setDividends(
        IEquity.Dividend calldata _newDividend
    ) internal virtual returns (bytes32 corporateActionId_, uint256 dividendId_);
    function _setScheduledBalanceAdjustment(
        IEquity.ScheduledBalanceAdjustment calldata _newBalanceAdjustment
    ) internal virtual returns (bytes32 corporateActionId_, uint256 balanceAdjustmentID_);
    function _setVoting(
        IEquity.Voting calldata _newVoting
    ) internal virtual returns (bytes32 corporateActionId_, uint256 voteID_);
    function _storeEquityDetails(IEquity.EquityDetailsData memory _equityDetailsData) internal virtual;
    function _getDividendAmountFor(
        uint256 _dividendID,
        address _account
    ) internal view virtual returns (IEquity.DividendAmountFor memory dividendAmountFor_);
    function _getDividendHolders(
        uint256 _dividendID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory holders_);
    function _getDividends(
        uint256 _dividendID
    ) internal view virtual returns (IEquity.RegisteredDividend memory registeredDividend_);
    function _getDividendsCount() internal view virtual returns (uint256 dividendCount_);
    function _getDividendsFor(
        uint256 _dividendID,
        address _account
    ) internal view virtual returns (IEquity.DividendFor memory dividendFor_);
    function _getEquityDetails() internal view virtual returns (IEquity.EquityDetailsData memory equityDetails_);
    function _getScheduledBalanceAdjustment(
        uint256 _balanceAdjustmentID
    ) internal view virtual returns (IEquity.ScheduledBalanceAdjustment memory balanceAdjustment_);
    function _getScheduledBalanceAdjustmentCount() internal view virtual returns (uint256);
    function _getTotalDividendHolders(uint256 _dividendID) internal view virtual returns (uint256);
    function _getTotalVotingHolders(uint256 _voteID) internal view virtual returns (uint256);
    function _getVoting(
        uint256 _voteID
    ) internal view virtual returns (IEquity.RegisteredVoting memory registeredVoting_);
    function _getVotingCount() internal view virtual returns (uint256 votingCount_);
    function _getVotingFor(
        uint256 _voteID,
        address _account
    ) internal view virtual returns (IEquity.VotingFor memory votingFor_);
    function _getVotingHolders(
        uint256 _voteID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory holders_);
}
