// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ISecurity} from '../interfaces/ISecurity.sol';
import {SecurityStorageWrapper} from './SecurityStorageWrapper.sol';
import {
    RegulationData,
    AdditionalSecurityData
} from '../constants/regulation.sol';
import {Common} from '../../layer_1/common/Common.sol';

abstract contract Security is ISecurity, SecurityStorageWrapper, Common {
    function _initializeSecurity(
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) internal returns (bool) {
        _storeRegulationData(_regulationData, _additionalSecurityData);
        return true;
    }

    function getSecurityRegulationData()
        external
        view
        override
        returns (SecurityRegulationData memory securityRegulationData_)
    {
        securityRegulationData_ = _getSecurityRegulationData();
    }
}
