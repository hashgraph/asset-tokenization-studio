// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { RegulationData, AdditionalSecurityData } from "../../layer_3/constants/regulation.sol";
import { _SECURITY_STORAGE_POSITION } from "../../layer_3/constants/storagePositions.sol";
import { ISecurity } from "../../layer_3/interfaces/ISecurity.sol";
import { EquityStorageWrapper } from "../equity/EquityStorageWrapper.sol";

abstract contract SecurityStorageWrapper is EquityStorageWrapper {
    function _initializeSecurity(
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) internal override {
        _storeRegulationData(_regulationData, _additionalSecurityData);
    }

    function _storeRegulationData(
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) internal override {
        ISecurity.SecurityRegulationData storage data = _securityStorage();
        data.regulationData = _regulationData;
        data.additionalSecurityData = _additionalSecurityData;
    }

    function _getSecurityRegulationData()
        internal
        pure
        override
        returns (ISecurity.SecurityRegulationData memory securityRegulationData_)
    {
        securityRegulationData_ = _securityStorage();
    }

    function _securityStorage() internal pure returns (ISecurity.SecurityRegulationData storage securityStorage_) {
        bytes32 position = _SECURITY_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            securityStorage_.slot := position
        }
    }
}
