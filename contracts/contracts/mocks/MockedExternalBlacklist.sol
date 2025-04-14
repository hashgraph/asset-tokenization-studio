// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {
    IExternalControlList
} from '../layer_1/interfaces/externalControlLists/IExternalControlList.sol';

contract MockedBlacklist is IExternalControlList {
    mapping(address => bool) private _blacklist;
    address[] private _blacklistedAddresses;

    event AddedToBlacklist(address indexed account);
    event RemovedFromBlacklist(address indexed account);

    function addToBlacklist(address account) external {
        if (!_blacklist[account]) {
            _blacklist[account] = true;
            _blacklistedAddresses.push(account);
            emit AddedToBlacklist(account);
        }
    }

    function removeFromBlacklist(address account) external {
        if (_blacklist[account]) {
            _blacklist[account] = false;
            uint256 length = _blacklistedAddresses.length;
            unchecked {
                for (uint256 i; i < length; ++i) {
                    if (_blacklistedAddresses[i] == account) {
                        _blacklistedAddresses[i] = _blacklistedAddresses[
                            length - 1
                        ];
                        _blacklistedAddresses.pop();
                        break;
                    }
                }
            }
            emit RemovedFromBlacklist(account);
        }
    }

    function isAuthorized(address account) external view returns (bool) {
        return !_blacklist[account];
    }

    function getListedAddresses() external view returns (address[] memory) {
        return _blacklistedAddresses;
    }
}
