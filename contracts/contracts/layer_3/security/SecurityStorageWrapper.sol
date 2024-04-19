// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {
    RegulationData,
    AdditionalSecurityData
} from '../constants/regulation.sol';
import {_SECURITY_STORAGE_POSITION} from '../constants/storagePositions.sol';
import {ISecurity} from '../interfaces/ISecurity.sol';

contract SecurityStorageWrapper {
    function _storeRegulationData(
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) internal {
        ISecurity.SecurityRegulationData storage data = _securityStorage();
        data.regulationData = _regulationData;
        data.additionalSecurityData = _additionalSecurityData;
    }

    function _getSecurityRegulationData()
        internal
        view
        returns (
            ISecurity.SecurityRegulationData memory securityRegulationData_
        )
    {
        securityRegulationData_ = _securityStorage();
    }

    function _securityStorage()
        internal
        view
        returns (ISecurity.SecurityRegulationData storage securityStorage_)
    {
        bytes32 position = _SECURITY_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            securityStorage_.slot := position
        }
    }
}
