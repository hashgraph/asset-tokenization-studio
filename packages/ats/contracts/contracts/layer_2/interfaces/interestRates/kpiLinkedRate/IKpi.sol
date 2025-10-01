// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IKpi {
    function getKpiData(
        uint256 _fromDate,
        uint256 _toDate
    ) external view returns (uint256 kpiAggregatedValue_, bool exists_);
}
