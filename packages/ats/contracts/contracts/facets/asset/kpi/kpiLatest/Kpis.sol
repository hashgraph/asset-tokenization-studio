// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKpis } from "../../kpi/kpiLatest/IKpis.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../../domain/core/AccessStorageWrapper.sol";
import { KpisStorageWrapper } from "../../../../domain/asset/KpisStorageWrapper.sol";
import { BondStorageWrapper } from "../../../../domain/asset/BondStorageWrapper.sol";
import { _KPI_MANAGER_ROLE } from "../../../../constants/roles.sol";
import { TimestampProvider } from "../../../../infrastructure/utils/TimestampProvider.sol";

/// @title Kpis
/// @notice Diamond facet for managing KPI data with library-based pattern
abstract contract Kpis is IKpis, TimestampProvider {
    function addKpiData(uint256 _date, uint256 _value, address _project) external override {
        AccessStorageWrapper.checkRole(_KPI_MANAGER_ROLE);
        PauseStorageWrapper.requireNotPaused();

        // Inline isValidDate modifier logic
        uint256 timestamp = _getBlockTimestamp();
        uint256 minDate = _getMinDateAdjusted(timestamp);
        if (_date <= minDate || _date > timestamp) {
            revert InvalidDate(_date, minDate, timestamp);
        }
        if (KpisStorageWrapper.isCheckpointDate(_date, _project)) {
            revert KpiDataAlreadyExists(_date);
        }

        KpisStorageWrapper.addKpiData(_date, _value, _project);
        emit IKpis.KpiDataAdded(_project, _date, _value);
    }

    function getLatestKpiData(
        uint256 _from,
        uint256 _to,
        address _project
    ) external view override returns (uint256 value_, bool exists_) {
        return KpisStorageWrapper.getLatestKpiData(_from, _to, _project);
    }

    function getMinDate() external view override returns (uint256 minDate_) {
        return _getMinDateAdjusted(_getBlockTimestamp());
    }

    function isCheckPointDate(uint256 _date, address _project) external view override returns (bool exists_) {
        return KpisStorageWrapper.isCheckpointDate(_date, _project);
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // INTERNAL HELPERS
    // ════════════════════════════════════════════════════════════════════════════════════

    /// @notice Gets the adjusted minimum date considering the last coupon fixing date
    /// @param _timestamp The timestamp to use for determining pending coupon listings
    function _getMinDateAdjusted(uint256 _timestamp) private view returns (uint256 minDate_) {
        minDate_ = KpisStorageWrapper.getMinDate();
        uint256 total = BondStorageWrapper.getCouponsOrderedListTotalAdjustedAt(_timestamp);
        if (total == 0) return minDate_;

        uint256 couponId = BondStorageWrapper.getCouponFromOrderedListAt(total - 1, _timestamp);
        uint256 lastFixingDate = BondStorageWrapper.getCoupon(couponId).coupon.fixingDate;
        // Only use the coupon's fixing date as minimum if it's in the past (not a future coupon)
        // This allows adding historical KPI data before future coupons are fixed
        if (lastFixingDate <= _timestamp) {
            assert(lastFixingDate >= minDate_);
            minDate_ = lastFixingDate;
        }
    }
}
