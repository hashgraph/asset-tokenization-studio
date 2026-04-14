// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED — DO NOT EDIT.
// Source: contracts/facets/layer_2/equity/IEquity.sol
// Regenerated on every `npx hardhat compile` by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts`.
// Edits to this file will be silently overwritten.
pragma solidity ^0.8.17;

interface TRexIEquity {
    enum DividendType {
        NONE,
        PREFERRED,
        COMMON
    }

    struct EquityDetailsData {
        bool votingRight;
        bool informationRight;
        bool liquidationRight;
        bool subscriptionRight;
        bool conversionRight;
        bool redemptionRight;
        bool putRight;
        DividendType dividendRight;
        bytes3 currency;
        uint256 nominalValue;
        uint8 nominalValueDecimals;
    }

    struct ScheduledBalanceAdjustment {
        uint256 executionDate;
        uint256 factor;
        uint8 decimals;
    }

    event ScheduledBalanceAdjustmentSet(
        bytes32 corporateActionId,
        uint256 balanceAdjustmentId,
        address indexed operator,
        uint256 indexed executionDate,
        uint256 factor,
        uint256 decimals
    );

    event ScheduledBalanceAdjustmentCancelled(uint256 balanceAdjustmentId, address indexed operator);

    error BalanceAdjustmentCreationFailed();
    error BalanceAdjustmentAlreadyExecuted(bytes32 corporateActionId, uint256 balanceAdjustmentId);

    /**
     * @notice Sets a new scheduled balance adjustment
     * @dev The task is added to the queue and executed when the execution date is reached
     */
    function setScheduledBalanceAdjustment(
        ScheduledBalanceAdjustment calldata _newBalanceAdjustment
    ) external returns (uint256 balanceAdjustmentID_);

    function cancelScheduledBalanceAdjustment(uint256 _balanceAdjustmentID) external returns (bool success_);

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
