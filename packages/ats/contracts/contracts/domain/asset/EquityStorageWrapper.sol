// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _EQUITY_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import {
    BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE,
    BALANCE_ADJUSTMENT_TASK_TYPE,
    KPI_EQUITY_BALANCE_ADJ
} from "../../constants/values.sol";
import { IEquity } from "../../facets/layer_2/equity/IEquity.sol";
import { CorporateActionsStorageWrapper } from "../core/CorporateActionsStorageWrapper.sol";
import { NominalValueStorageWrapper } from "./nominalValue/NominalValueStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
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
