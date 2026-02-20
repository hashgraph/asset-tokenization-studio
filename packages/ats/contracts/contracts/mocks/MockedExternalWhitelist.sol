// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalControlList } from "../facets/features/interfaces/IExternalControlList.sol";

contract MockedWhitelist is IExternalControlList {
    mapping(address => bool) private _whitelist;

    event AddedToWhitelist(address indexed account);
    event RemovedFromWhitelist(address indexed account);

    function addToWhitelist(address account) external {
        _whitelist[account] = true;
        emit AddedToWhitelist(account);
    }

    function removeFromWhitelist(address account) external {
        _whitelist[account] = false;
        emit RemovedFromWhitelist(account);
    }

    function isAuthorized(address account) external view returns (bool) {
        return _whitelist[account];
    }
}
