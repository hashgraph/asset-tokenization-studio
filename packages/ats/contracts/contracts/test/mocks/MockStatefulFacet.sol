// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { InitializerModifiers } from "../../services/core/InitializerModifiers.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { IAccessControl } from "../../facets/accessControl/IAccessControl.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";

/**
 * @title MockStatefulFacet
 * @author Asset Tokenization Studio Team
 * @notice Test-only facet with its own state for exercising the initialiser lifecycle.
 * @dev Used by initializer.test.ts in place of the old MockInitializableFacet.
 *   Provides initializeMock, reinitializeMock and doSomething to test
 *   onlyFacetNotRegistered, onlyFacetRegistered, onlyFacetNotReady and onlyOperational
 *   modifiers, as well as the setFacetToReady / setOperationalStatus flow.
 */
contract MockStatefulFacet is InitializerModifiers, IStaticFunctionSelectors {
    /// @notice Facet identifier used for initialiser storage lookups.
    bytes32 internal constant _MOCK_STATEFUL_ID = keccak256("test.MockStatefulFacet");

    /// @notice Resolver key exposed to the BLR for selector registration.
    bytes32 public constant MOCK_STATEFUL_KEY = keccak256("test.MockStatefulFacet");

    /**
     * @notice Thrown when the caller does not hold the default admin role.
     * @param account The address that failed the role check.
     */
    error UnauthorisedAccount(address account);

    /**
     * @notice Performs first-time initialisation of this facet.
     * @dev Callable only by the default admin. Reverts if the facet is already registered.
     *   Marks the facet as ready via `setFacetToReady`.
     */
    function initializeMock() external onlyFacetNotRegistered(_MOCK_STATEFUL_ID) {
        _checkDefaultAdmin();
        InitializerStorageWrapper.setFacetToReady(_MOCK_STATEFUL_ID);
    }

    /**
     * @notice Performs a version upgrade initialisation of this facet.
     * @dev Callable only by the default admin. Requires the facet to be registered at one
     *   of the accepted previous versions and not yet ready for the current version.
     * @param fromVersions Accepted previous versions for the upgrade path.
     */
    function reinitializeMock(
        uint256[] calldata fromVersions
    ) external onlyFacetRegistered(_MOCK_STATEFUL_ID, fromVersions) onlyFacetNotReady(_MOCK_STATEFUL_ID) {
        _checkDefaultAdmin();
        InitializerStorageWrapper.setFacetToReady(_MOCK_STATEFUL_ID);
    }

    /**
     * @notice Exercises the `onlyOperational` guard by returning a fixed value.
     * @return The constant value 42.
     */
    function doSomething() external onlyOperational returns (uint256) {
        return 42;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = MOCK_STATEFUL_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](3);
        staticFunctionSelectors_[0] = this.initializeMock.selector;
        staticFunctionSelectors_[1] = this.reinitializeMock.selector;
        staticFunctionSelectors_[2] = this.doSomething.selector;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](0);
    }

    /**
     * @notice Reverts if the caller does not hold the default admin role (role `0x00`).
     */
    function _checkDefaultAdmin() private view {
        if (!IAccessControl(address(this)).hasRole(0x00, msg.sender)) {
            revert UnauthorisedAccount(msg.sender);
        }
    }
}
