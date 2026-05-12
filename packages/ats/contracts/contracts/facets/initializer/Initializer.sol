// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { InitializerModifiers } from "../../services/core/InitializerModifiers.sol";
import { AccessControlModifiers } from "../../services/core/AccessControlModifiers.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { IInitializer } from "./IInitializer.sol";
import { _INITIALIZER_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { MAX_INITIALIZER_FACET_INDEX } from "../../constants/values.sol";

/**
 * @title Initializer
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of the IInitializer interface.
 * @dev All functions delegate directly to InitializerStorageWrapper, which manages the
 *   initialisation state in diamond storage.  Concrete facets inherit from this contract
 *   and expose the selectors via the diamond's facet registry.
 */
abstract contract Initializer is IInitializer, InitializerModifiers, AccessControlModifiers {
    /// @inheritdoc IInitializer
    function initializeInitializer()
        external
        onlyFacetNotRegistered(_INITIALIZER_RESOLVER_KEY)
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        InitializerStorageWrapper.setFacetToReady(_INITIALIZER_RESOLVER_KEY);
    }

    /// @inheritdoc IInitializer
    function setOperationalStatus() external {
        _setOperationalStatus(MAX_INITIALIZER_FACET_INDEX);
    }

    /// @inheritdoc IInitializer
    function getOperationalStatus(bytes32 _configId, uint256 _versionId) external view returns (uint256 status_) {
        status_ = InitializerStorageWrapper.getOperationalStatus(_configId, _versionId);
    }

    /// @inheritdoc IInitializer
    function getFacetVersionStatus(bytes32 _facetId, uint256 _versionId) external view returns (uint256 status_) {
        status_ = InitializerStorageWrapper.getFacetVersionStatus(_facetId, _versionId);
    }

    /// @inheritdoc IInitializer
    function getFacetLastVersion(bytes32 _facetId) external view returns (uint256 lastVersion_) {
        lastVersion_ = InitializerStorageWrapper.getFacetLastVersion(_facetId);
    }

    // @dev for testing purpose.
    function _setOperationalStatus(uint256 facetsPerPage) internal {
        (bytes32 configurationId, uint256 version, bool finished) = InitializerStorageWrapper.setOperationalStatus(
            facetsPerPage
        );
        if (finished) {
            emit OperationalStatusSet(configurationId, version);
        } else {
            emit OperationalStatusPartialSet(configurationId, version);
        }
    }
}
