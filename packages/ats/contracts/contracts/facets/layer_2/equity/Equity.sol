// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CORPORATE_ACTION_ROLE } from "../../../constants/roles.sol";
import {
    BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE
} from "../../../constants/values.sol";
import { IEquity } from "./IEquity.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { EquityStorageWrapper } from "../../../domain/asset/EquityStorageWrapper.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

abstract contract Equity is IEquity, Modifiers {
    function setScheduledBalanceAdjustment(
        ScheduledBalanceAdjustment calldata _newBalanceAdjustment
    )
        external
        override
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        onlyValidTimestamp(_newBalanceAdjustment.executionDate)
        onlyValidFactor(_newBalanceAdjustment.factor)
        returns (uint256 balanceAdjustmentID_)
    {
        bytes32 corporateActionID;
        (corporateActionID, balanceAdjustmentID_) = EquityStorageWrapper.setScheduledBalanceAdjustment(
            _newBalanceAdjustment
        );
        emit IEquity.ScheduledBalanceAdjustmentSet(
            corporateActionID,
            balanceAdjustmentID_,
            EvmAccessors.getMsgSender(),
            _newBalanceAdjustment.executionDate,
            _newBalanceAdjustment.factor,
            _newBalanceAdjustment.decimals
        );
    }

    function cancelScheduledBalanceAdjustment(
        uint256 _balanceAdjustmentId
    ) external override onlyUnpaused onlyRole(_CORPORATE_ACTION_ROLE) returns (bool success_) {
        (success_) = EquityStorageWrapper.cancelScheduledBalanceAdjustment(_balanceAdjustmentId);
        if (success_) {
            emit IEquity.ScheduledBalanceAdjustmentCancelled(_balanceAdjustmentId, EvmAccessors.getMsgSender());
        }
    }

    function getEquityDetails() external view override returns (EquityDetailsData memory equityDetailsData_) {
        return EquityStorageWrapper.getEquityDetails();
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
        (balanceAdjustment_, , isDisabled_) = EquityStorageWrapper.getScheduledBalanceAdjustment(_balanceAdjustmentID);
    }

    function getScheduledBalanceAdjustmentCount() external view override returns (uint256 balanceAdjustmentCount_) {
        return EquityStorageWrapper.getScheduledBalanceAdjustmentsCount();
    }

    // solhint-disable-next-line func-name-mixedcase
    function _initializeEquity(EquityDetailsData calldata _equityDetailsData) internal {
        EquityStorageWrapper.initializeEquityDetails(_equityDetailsData);
    }
}
