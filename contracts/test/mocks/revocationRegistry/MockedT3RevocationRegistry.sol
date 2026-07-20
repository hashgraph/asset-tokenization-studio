// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

contract MockedT3RevocationRegistry {
    mapping(address => mapping(string => bool)) public revoked;

    function revoke(string memory vcId) public {
        revoked[EvmAccessors.getMsgSender()][vcId] = true;
    }

    function cancelRevoke(string memory vcId) public {
        delete revoked[EvmAccessors.getMsgSender()][vcId];
    }
}
