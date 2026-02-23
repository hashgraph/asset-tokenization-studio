// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import { RegulationData, AdditionalSecurityData } from "../../../lib/domain/LibRegulation.sol";

interface ISecurity {
    struct SecurityRegulationData {
        RegulationData regulationData;
        AdditionalSecurityData additionalSecurityData;
    }

    /**
     * @notice Returns the security regulation data
     */
    function getSecurityRegulationData() external view returns (SecurityRegulationData memory securityRegulationData_);

    /**
     * @notice Returns the security holders for a given page index and page length
     */
    function getSecurityHolders(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_);

    function getTotalSecurityHolders() external view returns (uint256);
}
