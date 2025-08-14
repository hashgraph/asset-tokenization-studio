// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {
    IExternalControlList
} from '../layer_1/interfaces/externalControlLists/IExternalControlList.sol';

contract MockedBlacklist is IExternalControlList {
    mapping(address => bool) private _blacklist;

    event AddedToBlacklist(address indexed account);
    event RemovedFromBlacklist(address indexed account);

    function addToBlacklist(address account) external {
        _blacklist[account] = true;
        emit AddedToBlacklist(account);
    }

    function removeFromBlacklist(address account) external {
        _blacklist[account] = false;
        emit RemovedFromBlacklist(account);
    }

    function isAuthorized(address account) external view returns (bool) {
        return !_blacklist[account];
    }
}
