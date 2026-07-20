// SPDX-License-Identifier: Apache-2.0

/// solhint-disable
pragma solidity >=0.8.0 <0.9.0;

contract RevertingRevocationRegistry {
    function revoked(address, string calldata) external pure returns (bool) {
        revert("registry unavailable");
    }
}
/// solhint-enable
