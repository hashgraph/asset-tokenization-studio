// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

interface TRexIKpi {
    function setMinValidDate(uint256 _minValidDate) external;

    function getKpiData(
        uint256 _fromDate,
        uint256 _toDate
    ) external view returns (uint256 kpiAggregatedValue_, bool exists_);
}
