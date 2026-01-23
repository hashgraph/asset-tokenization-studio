// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract MockedKpiOracle {
    uint256 private _kpiValue;
    uint256 private _minValidDate;
    bool private _exists;

    function setKpiValue(uint256 kpiValue) external {
        _kpiValue = kpiValue;
    }

    function setExists(bool exists) external {
        _exists = exists;
    }

    function setMinValidDate(uint256 minValidDate) external {
        _minValidDate = minValidDate;
    }

    function getKpiData(uint256, uint256) external view returns (uint256, bool) {
        return (_kpiValue, _exists);
    }
}
