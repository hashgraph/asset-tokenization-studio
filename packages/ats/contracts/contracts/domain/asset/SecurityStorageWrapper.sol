// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { RegulationData, AdditionalSecurityData } from "../../constants/regulation.sol";
import { _SECURITY_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { ISecurity } from "../../facets/layer_2/security/ISecurity.sol";

library SecurityStorageWrapper {
    function securityStorage() internal pure returns (ISecurity.SecurityRegulationData storage securityStorage_) {
        bytes32 position = _SECURITY_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            securityStorage_.slot := position
        }
    }

    // --- State-changing functions ---

    // solhint-disable-next-line ordering
    function initializeSecurity(
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) internal {
        storeRegulationData(_regulationData, _additionalSecurityData);
    }

    function storeRegulationData(
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) internal {
        ISecurity.SecurityRegulationData storage data = securityStorage();
        data.regulationData = _regulationData;
        data.additionalSecurityData = _additionalSecurityData;
    }

    // --- Read functions ---

    function getSecurityRegulationData()
        internal
        pure
        returns (ISecurity.SecurityRegulationData memory securityRegulationData_)
    {
        securityRegulationData_ = securityStorage();
    }
}
