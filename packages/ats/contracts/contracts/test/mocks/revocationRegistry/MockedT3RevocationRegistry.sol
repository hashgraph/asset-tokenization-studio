// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

contract MockedT3RevocationRegistry {
    mapping(address => mapping(string => bool)) public revoked;

    function revoke(string memory vcId) public {
        revoked[msg.sender][vcId] = true;
    }

    function cancelRevoke(string memory vcId) public {
        delete revoked[msg.sender][vcId];
    }
}
