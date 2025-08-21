// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {
    IExternalKycList
} from '../layer_1/interfaces/externalKycLists/IExternalKycList.sol';
import {IKyc} from '../layer_1/interfaces/kyc/IKyc.sol';

contract MockedExternalKycList is IExternalKycList {
    mapping(address => IKyc.KycStatus) private _kycStatus;

    event KycGranted(address indexed account);
    event KycRevoked(address indexed account);

    function grantKyc(address account) external {
        _kycStatus[account] = IKyc.KycStatus.GRANTED;
        emit KycGranted(account);
    }

    function revokeKyc(address account) external {
        _kycStatus[account] = IKyc.KycStatus.NOT_GRANTED;
        emit KycRevoked(account);
    }

    function getKycStatus(
        address account
    ) external view override returns (IKyc.KycStatus) {
        return _kycStatus[account];
    }
}
