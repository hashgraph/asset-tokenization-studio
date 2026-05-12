// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { IInitializer } from "./IInitializer.sol";

/**
 * @title Initializer
 */
abstract contract Initializer is IInitializer {
    function setOperationalStatus() external returns (bool isOperational_, uint256 lastFacetIndex_) {
        return InitializerStorageWrapper.setOperationalStatus();
    }
    function getOperationalStatus(bytes32 _configId, uint256 _versionId) external view returns (uint256 status_) {
        status_ = InitializerStorageWrapper.getOperationalStatus(_configId, _versionId);
    }
    function getFacetVersionStatus(bytes32 _facetId, uint256 _versionId) external view returns (uint256 status_) {
        status_ = InitializerStorageWrapper.getFacetVersionStatus(_facetId, _versionId);
    }
    function getFacetLastVersion(bytes32 _facetId) external view returns (uint256 lastVersion_) {
        lastVersion_ = InitializerStorageWrapper.getFacetLastVersion(_facetId);
    }
}
