// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { EquityInternals } from "../equity/EquityInternals.sol";
import { ISecurity } from "../../layer_3/interfaces/ISecurity.sol";
import { RegulationData, AdditionalSecurityData } from "../../layer_3/constants/regulation.sol";

abstract contract SecurityInternals is EquityInternals {
    function _initializeSecurity(
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) internal virtual;
    function _storeRegulationData(
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    ) internal virtual;
    function _getSecurityRegulationData()
        internal
        pure
        virtual
        returns (ISecurity.SecurityRegulationData memory securityRegulationData_);
}
