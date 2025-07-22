// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ZERO_ADDRESS, EMPTY_BYTES} from '../constants/values.sol';
import {Eip1066} from '../constants/eip1066.sol';
import {IEip1066} from '../../layer_1/interfaces/eip1066/IEip1066.sol';
import {IKyc} from '../../layer_1/interfaces/kyc/IKyc.sol';
import {ERC20StorageWrapper1} from '../ERC1400/ERC20/ERC20StorageWrapper1.sol';

abstract contract ValidationCommon is ERC20StorageWrapper1 {
    // Example helper function for common checks
    function _checkAddressValidity(
        address _account
    )
        internal
        view
        returns (
            bool isValid,
            bytes1 statusCode,
            bytes32 reasonCode,
            bytes memory details
        )
    {
        if (_account == ZERO_ADDRESS) {
            return (
                false,
                Eip1066.NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE,
                IEip1066.ReasonInvalidZeroAddress.selector,
                EMPTY_BYTES
            );
        }

        if (_isRecovered(_account)) {
            return (
                false,
                Eip1066.REVOKED_OR_BANNED,
                IEip1066.ReasonAddressRecovered.selector,
                abi.encode(_account)
            );
        }

        if (!_isAbleToAccess(_account)) {
            return (
                false,
                Eip1066.DISALLOWED_OR_STOP,
                IEip1066.ReasonAddressInBlacklistOrNotInWhitelist.selector,
                abi.encode(_account)
            );
        }

        if (!_verifyKycStatus(IKyc.KycStatus.GRANTED, _account)) {
            return (
                false,
                Eip1066.DISALLOWED_OR_STOP,
                IEip1066.ReasonKycNotGranted.selector,
                abi.encode(_account)
            );
        }

        return (true, Eip1066.SUCCESS, bytes32(0), EMPTY_BYTES);
    }
}
