// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import { RegulationData, AdditionalSecurityData } from "../../../constants/regulation.sol";

interface ISecurity {
    struct SecurityRegulationData {
        RegulationData regulationData;
        AdditionalSecurityData additionalSecurityData;
    }

    /**
     * @notice Returns the security regulation data
     */
    function getSecurityRegulationData() external view returns (SecurityRegulationData memory securityRegulationData_);
}
