// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IInitializer
 */
interface IInitializer {
    function setOperationalStatus() external returns (bool isOperational_, uint256 lastFacetIndex_);
    function getOperationalStatus(bytes32 _configId, uint256 _versionId) external view returns (uint256 status_);
    function getFacetVersionStatus(bytes32 _facetId, uint256 _versionId) external view returns (uint256 status_);
    function getFacetLastVersion(bytes32 _facetId) external view returns (uint256 lastVersion_);
}
