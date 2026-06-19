// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title  IExternalControlList
 * @author Asset Tokenization Studio Team
 * @notice Minimal interface for querying an external control-list contract.
 * @dev    Implemented by third-party access-control contracts whose address is registered
 *         on the token. The token calls `isAuthorized` to decide whether a given account
 *         may participate in token operations.
 */
interface IExternalControlList {
    /**
     * @notice Returns whether `account` is authorised according to the external control list.
     * @param _account Address to check.
     * @return `true` if the account is on the allow-list; `false` otherwise.
     */
    function isAuthorized(address _account) external view returns (bool);
}
