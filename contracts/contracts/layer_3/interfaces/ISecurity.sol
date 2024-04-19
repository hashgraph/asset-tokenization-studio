// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
import {
    RegulationData,
    AdditionalSecurityData
} from '../constants/regulation.sol';

interface ISecurity {
    struct SecurityRegulationData {
        RegulationData regulationData;
        AdditionalSecurityData additionalSecurityData;
    }

    function getSecurityRegulationData()
        external
        view
        returns (SecurityRegulationData memory securityRegulationData_);
}
