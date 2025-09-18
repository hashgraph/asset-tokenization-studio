// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IRevocationList {
    /**
     * @notice Checks if the VC granted by an issuer to a subject has been revoked
     */
    function revoked(address, string calldata) external view returns (bool);
}
