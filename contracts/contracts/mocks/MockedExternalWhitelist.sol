// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {
    IExternalControlList
} from '../layer_1/interfaces/externalControlLists/IExternalControlList.sol';

contract MockedWhitelist is IExternalControlList {
    mapping(address => bool) private _whitelist;
    address[] private _whitelistedAddresses;

    event AddedToWhitelist(address indexed account);
    event RemovedFromWhitelist(address indexed account);

    function addToWhitelist(address account) external {
        if (!_whitelist[account]) {
            _whitelist[account] = true;
            _whitelistedAddresses.push(account);
            emit AddedToWhitelist(account);
        }
    }

    function removeFromWhitelist(address account) external {
        if (_whitelist[account]) {
            _whitelist[account] = false;
            uint256 length = _whitelistedAddresses.length;
            unchecked {
                for (uint256 i; i < length; ++i) {
                    if (_whitelistedAddresses[i] == account) {
                        _whitelistedAddresses[i] = _whitelistedAddresses[
                            length - 1
                        ];
                        _whitelistedAddresses.pop();
                        break;
                    }
                }
            }
            emit RemovedFromWhitelist(account);
        }
    }

    function isAuthorized(address account) external view returns (bool) {
        return _whitelist[account];
    }

    function getListedAddresses() external view returns (address[] memory) {
        return _whitelistedAddresses;
    }
}
