// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IEquityStorageWrapper } from "../../../domain/asset/equity/IEquityStorageWrapper.sol";

interface IEquity is IEquityStorageWrapper {
    enum DividendType {
        NONE,
        PREFERRED,
        COMMON
    }

    struct EquityDetailsData {
        bool votingRight; // TODO: review when will be storaged
        bool informationRight; // TODO: review when will be storaged
        bool liquidationRight; // TODO: review when will be storaged
        bool subscriptionRight; // TODO: review when will be storaged
        bool conversionRight; // TODO: review when will be storaged
        bool redemptionRight; // TODO: review when will be storaged
        bool putRight; // TODO: review when will be storaged
        DividendType dividendRight; // TODO: review when will be storaged
        bytes3 currency;
        uint256 nominalValue;
        uint8 nominalValueDecimals;
    }

    struct ScheduledBalanceAdjustment {
        uint256 executionDate;
        uint256 factor;
        uint8 decimals;
    }

    /**
     * @notice Sets a new scheduled balance adjustment
     * @dev The task is added to the queue and executed when the execution date is reached
     */
    function setScheduledBalanceAdjustment(
        ScheduledBalanceAdjustment calldata _newBalanceAdjustment
    ) external returns (uint256 balanceAdjustmentID_);

    /**
     * @notice Cancels a scheduled balance adjustment
     * @dev Can only be called by an account with the corporate actions role.
     * @param _balanceAdjustmentId The ID of the scheduled balance adjustment to cancel
     * @return success_ True if the scheduled balance adjustment was cancelled successfully
     */
    function cancelScheduledBalanceAdjustment(uint256 _balanceAdjustmentId) external returns (bool success_);

    function getEquityDetails() external view returns (EquityDetailsData memory equityDetailsData_);

    /**
     * @notice Returns the details of a previously scheduled balance adjustment
     */
    function getScheduledBalanceAdjustment(
        uint256 _balanceAdjustmentID
    ) external view returns (ScheduledBalanceAdjustment memory balanceAdjustment_, bool isDisabled_);

    /**
     * @notice Returns the total number of scheduled balance adjustments
     */
    function getScheduledBalanceAdjustmentCount() external view returns (uint256 balanceAdjustmentCount_);
}
