// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CheckpointsLib } from "contracts/layer_0/common/libraries/CheckpointsLib.sol";
import { ModifiersKpiInterestRate } from "./Modifiers.sol";
import { IBondRead } from "contracts/layer_2/interfaces/bond/IBondRead.sol";

abstract contract InternalsKpiInterestRate is ModifiersKpiInterestRate {
    // ===== KPIs Methods =====
    function _addKpiData(uint256 _date, uint256 _value, address _project) internal virtual;
    function _pushKpiData(CheckpointsLib.Checkpoint[] storage _ckpt, uint256 _date, uint256 _value) internal virtual;
    function _overwriteKpiData(
        CheckpointsLib.Checkpoint[] storage _ckpt,
        uint256 _date,
        uint256 _value,
        uint256 _pos
    ) internal virtual;
    function _setMinDate(uint256 _date) internal virtual;
    function _setCheckpointDate(uint256 _date, address _project) internal virtual;
    function _getLatestKpiData(
        uint256 _from,
        uint256 _to,
        address _project
    ) internal view virtual returns (uint256 value_, bool exists_);
    function _getMinDateAdjusted() internal view virtual returns (uint256 minDate_);
    function _isCheckpointDate(uint256 _date, address _project) internal view virtual returns (bool);
}
