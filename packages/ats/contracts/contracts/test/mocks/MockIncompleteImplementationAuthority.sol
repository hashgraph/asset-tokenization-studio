// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

/**
 * @notice Mock contract for testing incomplete implementation authority
 * @dev Returns zero address for all implementation getters
 */
contract MockIncompleteImplementationAuthority {
    function getCTRImplementation() external pure returns (address) {
        return address(0);
    }

    function getIRImplementation() external pure returns (address) {
        return address(0);
    }

    function getIRSImplementation() external pure returns (address) {
        return address(0);
    }

    function getMCImplementation() external pure returns (address) {
        return address(0);
    }

    function getTIRImplementation() external pure returns (address) {
        return address(0);
    }
}
