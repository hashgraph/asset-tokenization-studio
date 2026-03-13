// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _KPIS_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IKpis } from "../../facets/layer_2/kpi/kpiLatest/IKpis.sol";
import { Checkpoints } from "../../infrastructure/utils/Checkpoints.sol";
import { BondStorageWrapper } from "./BondStorageWrapper.sol";

struct KpisDataStorage {
    mapping(address => Checkpoints.Checkpoint[]) checkpointsByProject;
    mapping(address => mapping(uint256 => bool)) checkpointsDatesByProject;
    uint256 minDate;
}

library KpisStorageWrapper {
    using Checkpoints for Checkpoints.Checkpoint[];

    function _kpisDataStorage() internal pure returns (KpisDataStorage storage kpisDataStorage_) {
        bytes32 position = _KPIS_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            kpisDataStorage_.slot := position
        }
    }

    // solhint-disable-next-line ordering
    function _requireValidDate(uint256 date, address project) internal view {
        uint256 minDate = _getMinDateAdjusted();
        if (date <= minDate || date > block.timestamp) {
            revert IKpis.InvalidDate(date, minDate, block.timestamp);
        }
        if (_isCheckpointDate(date, project)) {
            revert IKpis.KpiDataAlreadyExists(date);
        }
    }

    function _addKpiData(uint256 date, uint256 value, address project) internal {
        assert(!_isCheckpointDate(date, project));
        _setCheckpointDate(date, project);

        Checkpoints.Checkpoint[] storage ckpt = _kpisDataStorage().checkpointsByProject[project];
        uint256 length = ckpt.length;

        if (length == 0 || ckpt[length - 1].from < date) {
            _pushKpiData(ckpt, date, value);
            emit IKpis.KpiDataAdded(project, date, value);
            return;
        }

        _pushKpiData(ckpt, ckpt[length - 1].from, ckpt[length - 1].value);

        for (uint256 index = length - 1; index >= 0; index--) {
            if (index == 0) {
                _overwriteKpiData(ckpt, date, value, index);
                break;
            }

            assert(ckpt[index - 1].from != date);

            if (ckpt[index - 1].from < date) {
                _overwriteKpiData(ckpt, date, value, index);
                break;
            }
            _overwriteKpiData(ckpt, ckpt[index - 1].from, ckpt[index - 1].value, index);
        }

        emit IKpis.KpiDataAdded(project, date, value);
    }

    function _pushKpiData(Checkpoints.Checkpoint[] storage ckpt, uint256 date, uint256 value) internal {
        ckpt.push(Checkpoints.Checkpoint({ from: date, value: value }));
    }

    function _overwriteKpiData(
        Checkpoints.Checkpoint[] storage ckpt,
        uint256 date,
        uint256 value,
        uint256 pos
    ) internal {
        ckpt[pos].from = date;
        ckpt[pos].value = value;
    }

    function _setMinDate(uint256 date) internal {
        _kpisDataStorage().minDate = date;
    }

    function _setCheckpointDate(uint256 date, address project) internal {
        _kpisDataStorage().checkpointsDatesByProject[project][date] = true;
    }

    function _addToCouponsOrderedList(uint256 couponID) internal {
        BondStorageWrapper._addToCouponsOrderedList(couponID);

        uint256 lastFixingDate = BondStorageWrapper._getCoupon(couponID).coupon.fixingDate;

        assert(lastFixingDate >= _kpisDataStorage().minDate);

        _setMinDate(lastFixingDate);
    }

    function _getLatestKpiData(
        uint256 from,
        uint256 to,
        address project
    ) internal view returns (uint256 value_, bool exists_) {
        (uint256 checkpointFrom, uint256 value) = _kpisDataStorage().checkpointsByProject[project].checkpointsLookup(
            to
        );
        if (checkpointFrom <= from) return (0, false);
        return (value, true);
    }

    function _getMinDateAdjusted() internal view returns (uint256 minDate_) {
        minDate_ = _kpisDataStorage().minDate;

        uint256 total = BondStorageWrapper._getCouponsOrderedListTotalAdjustedAt(block.timestamp);

        if (total == 0) return minDate_;

        uint256 lastFixingDate = BondStorageWrapper
            .getCoupon(BondStorageWrapper._getCouponFromOrderedListAt(total - 1))
            .coupon
            .fixingDate;

        assert(lastFixingDate >= minDate_);

        minDate_ = lastFixingDate;
    }

    function _isCheckpointDate(uint256 date, address project) internal view returns (bool) {
        return _kpisDataStorage().checkpointsDatesByProject[project][date];
    }
}
