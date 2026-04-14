// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _KPIS_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { KPI_KPIS_ADD_COUPON_DATE, KPI_KPIS_SET_MINDATE } from "../../constants/values.sol";
import { IKpis } from "../../facets/layer_2/kpi/kpiLatest/IKpis.sol";
import { Checkpoints } from "../../infrastructure/utils/Checkpoints.sol";
import { CouponStorageWrapper } from "./CouponStorageWrapper.sol";
import { ICoupon } from "../../facets/layer_2/coupon/ICoupon.sol";
import { BondStorageWrapper } from "./BondStorageWrapper.sol";
import { IBondTypes } from "../../facets/layer_2/bond/IBondTypes.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";

struct KpisDataStorage {
    mapping(address => Checkpoints.Checkpoint[]) checkpointsByProject;
    mapping(address => mapping(uint256 => bool)) checkpointsDatesByProject;
    uint256 minDate;
}

library KpisStorageWrapper {
    using Checkpoints for Checkpoints.Checkpoint[];

    function addKpiData(uint256 date, uint256 value, address project) internal {
        require(!isCheckpointDate(date, project), IKpis.KpiDataAlreadyExists(date));
        setCheckpointDate(date, project);
        Checkpoints.Checkpoint[] storage ckpt = kpisDataStorage().checkpointsByProject[project];
        uint256 length = ckpt.length;
        uint256 latest;
        unchecked {
            latest = length - 1;
        }

        // Fast path: append to end
        if (length == 0 || ckpt[latest].from < date) {
            ckpt.push(Checkpoints.Checkpoint({ from: date, value: value }));
            emit IKpis.KpiDataAdded(project, date, value);
            return;
        }
        // Insert in sorted position: extend array, shift right, write new element
        ckpt.push(Checkpoints.Checkpoint({ from: ckpt[latest].from, value: ckpt[latest].value }));
        unchecked {
            for (uint256 i = length; i > 0; --i) {
                uint256 prev = i - 1;
                if (ckpt[prev].from <= date) {
                    ckpt[i] = Checkpoints.Checkpoint({ from: date, value: value });
                    emit IKpis.KpiDataAdded(project, date, value);
                    return;
                }
                ckpt[i] = ckpt[prev];
            }
        }
        // Insert at position 0
        ckpt[0] = Checkpoints.Checkpoint({ from: date, value: value });
        emit IKpis.KpiDataAdded(project, date, value);
    }

    function addToCouponsOrderedList(uint256 couponID) internal {
        CouponStorageWrapper.addToCouponsOrderedList(couponID);

        (ICoupon.RegisteredCoupon memory coupon, , ) = CouponStorageWrapper.getCoupon(couponID);
        uint256 lastFixingDate = coupon.coupon.fixingDate;

        _checkUnexpectedError(lastFixingDate < kpisDataStorage().minDate, KPI_KPIS_ADD_COUPON_DATE);

        setMinDate(lastFixingDate);
    }

    function pushKpiData(Checkpoints.Checkpoint[] storage ckpt, uint256 date, uint256 value) internal {
        ckpt.push(Checkpoints.Checkpoint({ from: date, value: value }));
    }

    function overwriteKpiData(
        Checkpoints.Checkpoint[] storage ckpt,
        uint256 date,
        uint256 value,
        uint256 pos
    ) internal {
        ckpt[pos].from = date;
        ckpt[pos].value = value;
    }

    function setMinDate(uint256 date) internal {
        kpisDataStorage().minDate = date;
    }

    function setCheckpointDate(uint256 date, address project) internal {
        kpisDataStorage().checkpointsDatesByProject[project][date] = true;
    }

    function requireValidDate(uint256 date, address project) internal view {
        uint256 minDate = getMinDateAdjusted();
        if (date <= minDate || date > TimeTravelStorageWrapper.getBlockTimestamp()) {
            revert IKpis.InvalidDate(date, minDate, TimeTravelStorageWrapper.getBlockTimestamp());
        }
        if (isCheckpointDate(date, project)) {
            revert IKpis.KpiDataAlreadyExists(date);
        }
    }

    function getLatestKpiData(uint256 from, uint256 to, address project) internal view returns (uint256, bool) {
        (uint256 checkpointFrom, uint256 value_) = kpisDataStorage().checkpointsByProject[project].checkpointsLookup(
            to
        );
        if (checkpointFrom <= from) return (0, false);
        return (value_, true);
    }

    function getMinDateAdjusted() internal view returns (uint256 minDate_) {
        minDate_ = kpisDataStorage().minDate;

        uint256 total = CouponStorageWrapper.getCouponsOrderedListTotalAdjustedAt(
            TimeTravelStorageWrapper.getBlockTimestamp()
        );

        if (total == 0) return minDate_;

        (ICoupon.RegisteredCoupon memory lastCoupon, , ) = CouponStorageWrapper.getCoupon(
            CouponStorageWrapper.getCouponFromOrderedListAt(total - 1)
        );
        uint256 lastFixingDate = lastCoupon.coupon.fixingDate;

        _checkUnexpectedError(lastFixingDate < minDate_, KPI_KPIS_SET_MINDATE);

        minDate_ = lastFixingDate;
    }

    function isCheckpointDate(uint256 date, address project) internal view returns (bool) {
        return kpisDataStorage().checkpointsDatesByProject[project][date];
    }

    function kpisDataStorage() internal pure returns (KpisDataStorage storage kpisDataStorage_) {
        bytes32 position = _KPIS_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            kpisDataStorage_.slot := position
        }
    }
}
