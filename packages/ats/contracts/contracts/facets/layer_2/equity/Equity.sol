// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CORPORATE_ACTION_ROLE } from "../../../constants/roles.sol";
import {
    VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
    BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE
} from "../../../constants/values.sol";
import { IEquity } from "./IEquity.sol";
import { Common } from "../../../domain/Common.sol";

abstract contract Equity is IEquity, Common {
    function cancelScheduledBalanceAdjustment(
        uint256 _balanceAdjustmentId
    ) external override onlyUnpaused onlyRole(_CORPORATE_ACTION_ROLE) returns (bool success_) {
        (success_) = _cancelScheduledBalanceAdjustment(_balanceAdjustmentId);
    }

    function setScheduledBalanceAdjustment(
        ScheduledBalanceAdjustment calldata _newBalanceAdjustment
    )
        external
        override
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        onlyValidTimestamp(_newBalanceAdjustment.executionDate)
        validateFactor(_newBalanceAdjustment.factor)
        returns (uint256 balanceAdjustmentID_)
    {
        bytes32 corporateActionID;
        (corporateActionID, balanceAdjustmentID_) = _setScheduledBalanceAdjustment(_newBalanceAdjustment);
        emit ScheduledBalanceAdjustmentSet(
            corporateActionID,
            balanceAdjustmentID_,
            _msgSender(),
            _newBalanceAdjustment.executionDate,
            _newBalanceAdjustment.factor,
            _newBalanceAdjustment.decimals
        );
    }

    function getEquityDetails() external view override returns (EquityDetailsData memory equityDetailsData_) {
        return _getEquityDetails();
    }

    function getScheduledBalanceAdjustment(
        uint256 _balanceAdjustmentID
    )
        external
        view
        override
        onlyMatchingActionType(BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE, _balanceAdjustmentID - 1)
        returns (ScheduledBalanceAdjustment memory balanceAdjustment_, bool isDisabled_)
    {
        (balanceAdjustment_, , isDisabled_) = _getScheduledBalanceAdjustment(_balanceAdjustmentID);
    }

    function getScheduledBalanceAdjustmentCount() external view override returns (uint256 balanceAdjustmentCount_) {
        return _getScheduledBalanceAdjustmentsCount();
    }
}
