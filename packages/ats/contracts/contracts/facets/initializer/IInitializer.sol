// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IInitializer
 */
interface IInitializer {
    error AssetNotOperational(bytes32 configId, uint256 versionId);
    error FacetAlreadyRegistered(bytes32 facetId, uint256 lastVersion);
    error FacetPreviousVersionNotAccepted(bytes32 facetId, uint256 lastVersion, uint256[] expectedVersions);
    error FacetReady(bytes32 facetId, uint256 versionId);

    function setOperationalStatus() external returns (bool isOperational_, uint256 lastFacetIndex_);
    function getOperationalStatus(bytes32 _configId, uint256 _versionId) external view returns (uint256 status_);
    function getFacetVersionStatus(bytes32 _facetId, uint256 _versionId) external view returns (uint256 status_);
    function getFacetLastVersion(bytes32 _facetId) external view returns (uint256 lastVersion_);
}
