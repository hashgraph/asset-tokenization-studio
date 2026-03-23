// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IInitializationErrors
 * @notice Interface for initialization-related errors shared across facets
 * @dev This interface provides standardized errors for initialization checks
 *      used by InitializationModifiers and domain-specific StorageWrappers.
 * @author Asset Tokenization Studio Team
 */
interface IInitializationErrors {
    /**
     * @notice Thrown when attempting to initialize an already initialized component
     * @param initialized Current initialization state (always true when error is thrown)
     */
    error AlreadyInitialized(bool initialized);
}
