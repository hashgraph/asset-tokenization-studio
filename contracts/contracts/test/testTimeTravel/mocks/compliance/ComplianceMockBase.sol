// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

abstract contract ComplianceMockBase {
    function transferred(
        address _from,
        address _to,
        uint256 _amount
    ) external {}
    function created(address _to, uint256 _amount) external {}
    function destroyed(address _from, uint256 _amount) external {}

    function canTransfer(
        address _from,
        address _to,
        uint256 _amount
    ) external view virtual returns (bool) {}
}
