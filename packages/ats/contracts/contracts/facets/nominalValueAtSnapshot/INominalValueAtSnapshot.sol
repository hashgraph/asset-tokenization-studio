// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title INominalValueAtSnapshot
 */
interface INominalValueAtSnapshot {
    function nominalValueAtSnapshot(uint256 _snapshotID) external view returns (uint256 nominalValue_);

    function nominalValueDecimalsAtSnapshot(uint256 _snapshotID) external view returns (uint8 nominalValueDecimals_);
}
