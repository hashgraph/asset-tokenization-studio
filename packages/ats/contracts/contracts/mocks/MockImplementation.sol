// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * MockImplementation - Simple implementation for TUP upgrade testing.
 *
 * Provides a basic implementation with a version identifier for testing
 * TransparentUpgradeableProxy (TUP) upgrade functionality.
 *
 * Includes initialization guard to prevent double initialization,
 * matching real-world implementation patterns.
 */
contract MockImplementation {
    /**
     * Tracks whether the contract has been initialized.
     */
    bool private _initialized;

    /**
     * State variable to verify initialization.
     */
    uint256 public initializedValue;

    /**
     * Error thrown when attempting to initialize twice.
     */
    error AlreadyInitialized();

    /**
     * Base initialization function.
     * Can be called during proxy deployment.
     * Includes guard to prevent double initialization.
     */
    function initialize() external {
        if (_initialized) {
            revert AlreadyInitialized();
        }
        _initialized = true;
        initializedValue = 100; // Set initial value to verify initialization occurred
    }

    /**
     * Check if contract has been initialized.
     * @return True if initialized, false otherwise
     */
    function initialized() external view returns (bool) {
        return _initialized;
    }

    /**
     * Returns the implementation version number.
     * @return Version identifier (1 for initial implementation)
     */
    function version() external pure returns (uint256) {
        return 1;
    }

    /**
     * Simple function to verify contract is operational.
     * @return A test string
     */
    function greet() external pure returns (string memory) {
        return "Hello from V1";
    }
}
