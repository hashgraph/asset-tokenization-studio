// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _KPIS_STORAGE_POSITION } from "contracts/layer_0/constants/storagePositions.sol";
import { IKpis } from "../../../../../../layer_2/interfaces/kpis/kpiLatest/IKpis.sol";
import { CheckpointsLib } from "contracts/layer_0/common/libraries/CheckpointsLib.sol";
import { IBondRead } from "../../../../../../layer_2/interfaces/bond/IBondRead.sol";
import { BondStorageWrapperFixingDateInterestRate } from "../../../BondStorageWrapperFixingDateInterestRate.sol";

abstract contract KpisStorageWrapper is BondStorageWrapperFixingDateInterestRate {
    using CheckpointsLib for CheckpointsLib.Checkpoint[];

    struct KpisDataStorage {
        mapping(address => CheckpointsLib.Checkpoint[]) checkpointsByProject;
        mapping(address => mapping(uint256 => bool)) checkpointsDatesByProject;
        uint256 minDate;
    }

    modifier isValidDate(uint256 _date, address _project) {
        if (_date <= _getMinDateAdjusted() || _date > _blockTimestamp()) {
            revert IKpis.InvalidDate(_date, _getMinDateAdjusted(), _blockTimestamp());
        }
        if (_isCheckpointDate(_date, _project)) {
            revert IKpis.KpiDataAlreadyExists(_date);
        }
        _;
    }

    function _addKpiData(uint256 _date, uint256 _value, address _project) internal {
        assert(_isCheckpointDate(_date, _project) == false);
        _setCheckpointDate(_date, _project);

        CheckpointsLib.Checkpoint[] storage ckpt = _kpisDataStorage().checkpointsByProject[_project];
        uint256 length = ckpt.length;

        if (length == 0 || ckpt[length - 1].from < _date) {
            _pushKpiData(ckpt, _date, _value);
            return;
        }

        _pushKpiData(ckpt, ckpt[length - 1].from, ckpt[length - 1].value);

        for (uint256 index = length - 1; index >= 0; index--) {
            if (index == 0) {
                _overwriteKpiData(ckpt, _date, _value, index);
                break;
            }

            assert(ckpt[index - 1].from != _date);

            if (ckpt[index - 1].from < _date) {
                _overwriteKpiData(ckpt, _date, _value, index);
                break;
            }
            _overwriteKpiData(ckpt, ckpt[index - 1].from, ckpt[index - 1].value, index);
        }

        emit IKpis.KpiDataAdded(_project, _date, _value);
    }

    function _pushKpiData(CheckpointsLib.Checkpoint[] storage _ckpt, uint256 _date, uint256 _value) internal {
        _ckpt.push(CheckpointsLib.Checkpoint({ from: _date, value: _value }));
    }

    function _overwriteKpiData(
        CheckpointsLib.Checkpoint[] storage _ckpt,
        uint256 _date,
        uint256 _value,
        uint256 _pos
    ) internal {
        _ckpt[_pos].from = _date;
        _ckpt[_pos].value = _value;
    }

    function _setMinDate(uint256 _date) internal {
        _kpisDataStorage().minDate = _date;
    }

    function _setCheckpointDate(uint256 _date, address _project) internal {
        _kpisDataStorage().checkpointsDatesByProject[_project][_date] = true;
    }

    function _addToCouponsOrderedList(uint256 _couponID) internal virtual override {
        super._addToCouponsOrderedList(_couponID);

        uint256 lastFixingDate = _getCoupon(_couponID).coupon.fixingDate;

        if (lastFixingDate > _kpisDataStorage().minDate) _kpisDataStorage().minDate = lastFixingDate;
    }

    function _getLatestKpiData(
        uint256 _from,
        uint256 _to,
        address _project
    ) internal view returns (uint256 value_, bool exists_) {
        (uint256 from, uint256 value) = _kpisDataStorage().checkpointsByProject[_project].checkpointsLookup(_to);
        if (from <= _from) return (0, false);
        return (value, true);
    }

    function _getMinDateAdjusted() internal view returns (uint256 minDate_) {
        minDate_ = _kpisDataStorage().minDate;

        uint256 total = _getCouponsOrderedListTotalAdjusted();

        if (total == 0) return minDate_;

        uint256 lastFixingDate = _getCoupon(_getCouponFromOrderedListAt(total - 1)).coupon.fixingDate;

        if (lastFixingDate > minDate_) minDate_ = lastFixingDate;
    }

    function _isCheckpointDate(uint256 _date, address _project) internal view returns (bool) {
        return _kpisDataStorage().checkpointsDatesByProject[_project][_date];
    }

    function _kpisDataStorage() internal pure returns (KpisDataStorage storage kpisDataStorage_) {
        bytes32 position = _KPIS_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            kpisDataStorage_.slot := position
        }
    }
}
