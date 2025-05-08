// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {
    IExternalKycList
} from '../layer_1/interfaces/externalKycLists/IExternalKycList.sol';

contract MockedExternalKycList is IExternalKycList {
    mapping(address => bool) private _granted;

    event KycGranted(address indexed account);
    event KycRevoked(address indexed account);

    function grantKyc(address account) external {
        _granted[account] = true;
        emit KycGranted(account);
    }

    function revokeKyc(address account) external {
        _granted[account] = false;
        emit KycRevoked(account);
    }

    function isGranted(address account) external view override returns (bool) {
        return _granted[account];
    }
}
