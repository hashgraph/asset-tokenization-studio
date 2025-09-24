// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IExternalControlList {
    /**
     * @dev Checks user control list status in the external control list contract
     */
    function isAuthorized(address account) external view returns (bool);
}
