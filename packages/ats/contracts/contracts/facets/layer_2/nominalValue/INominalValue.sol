// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface INominalValue {
    event NominalValueSet(address indexed operator, uint256 nominalValue, uint8 nominalValueDecimals);

    // solhint-disable-next-line func-name-mixedcase
    function initialize_NominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals) external;
    function setNominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals) external;
    function getNominalValue() external view returns (uint256);
    function getNominalValueDecimals() external view returns (uint8);
}
