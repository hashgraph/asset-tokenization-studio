// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKpis } from "../../interfaces/kpis/kpiLatest/IKpis.sol";
import { LibPause } from "../../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../../lib/core/LibAccess.sol";
import { LibKpis } from "../../../../lib/domain/LibKpis.sol";
import { LibBond } from "../../../../lib/domain/LibBond.sol";
import { _KPI_MANAGER_ROLE } from "../../../../constants/roles.sol";
import { TimestampProvider } from "../../../../infrastructure/lib/TimestampProvider.sol";

/// @title Kpis
/// @notice Diamond facet for managing KPI data with library-based pattern
abstract contract Kpis is IKpis, TimestampProvider {
    function addKpiData(uint256 _date, uint256 _value, address _project) external override {
        LibAccess.checkRole(_KPI_MANAGER_ROLE);
        LibPause.requireNotPaused();

        // Inline isValidDate modifier logic
        uint256 timestamp = _getBlockTimestamp();
        uint256 minDate = _getMinDateAdjusted(timestamp);
        if (_date <= minDate || _date > timestamp) {
            revert InvalidDate(_date, minDate, timestamp);
        }
        if (LibKpis.isCheckpointDate(_date, _project)) {
            revert KpiDataAlreadyExists(_date);
        }

        LibKpis.addKpiData(_date, _value, _project);
        emit IKpis.KpiDataAdded(_project, _date, _value);
    }

    function getLatestKpiData(
        uint256 _from,
        uint256 _to,
        address _project
    ) external view override returns (uint256 value_, bool exists_) {
        return LibKpis.getLatestKpiData(_from, _to, _project);
    }

    function getMinDate() external view override returns (uint256 minDate_) {
        return _getMinDateAdjusted(_getBlockTimestamp());
    }

    function isCheckPointDate(uint256 _date, address _project) external view override returns (bool exists_) {
        return LibKpis.isCheckpointDate(_date, _project);
    }

    // ════════════════════════════════════════════════════════════════════════════════════
    // INTERNAL HELPERS
    // ════════════════════════════════════════════════════════════════════════════════════

    /// @notice Gets the adjusted minimum date considering the last coupon fixing date
    /// @param _timestamp The timestamp to use for determining pending coupon listings
    function _getMinDateAdjusted(uint256 _timestamp) private view returns (uint256 minDate_) {
        minDate_ = LibKpis.getMinDate();
        uint256 total = LibBond.getCouponsOrderedListTotalAdjustedAt(_timestamp);
        if (total == 0) return minDate_;

        uint256 couponId = LibBond.getCouponFromOrderedListAt(total - 1, _timestamp);
        uint256 lastFixingDate = LibBond.getCoupon(couponId).coupon.fixingDate;
        // Only use the coupon's fixing date as minimum if it's in the past (not a future coupon)
        // This allows adding historical KPI data before future coupons are fixed
        if (lastFixingDate <= _timestamp) {
            assert(lastFixingDate >= minDate_);
            minDate_ = lastFixingDate;
        }
    }
}
