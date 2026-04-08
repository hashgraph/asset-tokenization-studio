// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _KPIS_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IKpis } from "../../facets/layer_2/kpi/kpiLatest/IKpis.sol";
import { Checkpoints } from "../../infrastructure/utils/Checkpoints.sol";
import { BondStorageWrapper } from "./BondStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

struct KpisDataStorage {
    mapping(address => Checkpoints.Checkpoint[]) checkpointsByProject;
    mapping(address => mapping(uint256 => bool)) checkpointsDatesByProject;
    uint256 minDate;
}

library KpisStorageWrapper {
    using Checkpoints for Checkpoints.Checkpoint[];

    function addKpiData(uint256 date, uint256 value, address project) internal {
        assert(!isCheckpointDate(date, project));
        setCheckpointDate(date, project);

        Checkpoints.Checkpoint[] storage ckpt = kpisDataStorage().checkpointsByProject[project];
        uint256 length = ckpt.length;

        if (length == 0 || ckpt[length - 1].from < date) {
            pushKpiData(ckpt, date, value);
            emit IKpis.KpiDataAdded(project, date, value);
            return;
        }

        pushKpiData(ckpt, ckpt[length - 1].from, ckpt[length - 1].value);

        for (uint256 index = length - 1; index >= 0; index--) {
            if (index == 0) {
                overwriteKpiData(ckpt, date, value, index);
                break;
            }

            assert(ckpt[index - 1].from != date);

            if (ckpt[index - 1].from < date) {
                overwriteKpiData(ckpt, date, value, index);
                break;
            }
            overwriteKpiData(ckpt, ckpt[index - 1].from, ckpt[index - 1].value, index);
        }

        emit IKpis.KpiDataAdded(project, date, value);
    }

    function addToCouponsOrderedList(uint256 couponID) internal {
        BondStorageWrapper.addToCouponsOrderedList(couponID);

        uint256 lastFixingDate = BondStorageWrapper.getCoupon(couponID).coupon.fixingDate;

        assert(lastFixingDate >= kpisDataStorage().minDate);

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

    function getLatestKpiData(
        uint256 from,
        uint256 to,
        address project
    ) internal view returns (uint256 value_, bool exists_) {
        (uint256 checkpointFrom, uint256 value) = kpisDataStorage().checkpointsByProject[project].checkpointsLookup(to);
        if (checkpointFrom <= from) return (0, false);
        return (value, true);
    }

    function getMinDateAdjusted() internal view returns (uint256 minDate_) {
        minDate_ = kpisDataStorage().minDate;

        uint256 total = BondStorageWrapper.getCouponsOrderedListTotalAdjustedAt(
            TimeTravelStorageWrapper.getBlockTimestamp()
        );

        if (total == 0) return minDate_;

        uint256 lastFixingDate = BondStorageWrapper
            .getCoupon(BondStorageWrapper.getCouponFromOrderedListAt(total - 1))
            .coupon
            .fixingDate;

        assert(lastFixingDate >= minDate_);

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
