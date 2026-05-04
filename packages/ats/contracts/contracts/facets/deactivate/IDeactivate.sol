// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IDeactivate
 */
interface IDeactivate {
    error Deactivated();

    function deactivate() external;
    function isDeactivated() external view returns (bool);
}
