// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * MockImplementationV2 - Upgraded implementation for TUP upgrade testing.
 *
 * Provides an upgraded implementation with:
 * - New version number (2)
 * - New state variable (newState)
 * - New initialization function (initializeV2)
 *
 * Used to test TransparentUpgradeableProxy (TUP) upgrade functionality,
 * including upgradeAndCall pattern with reinitialization.
 *
 * **Storage Layout Compatibility:**
 * V2 must be storage-compatible with V1:
 * - Slot 0: bool _initialized (from V1)
 * - Slot 1: uint256 initializedValue (from V1)
 * - Slot 2: bool _initializedV2 (new in V2)
 * - Slot 3: uint256 newState (new in V2)
 */
contract MockImplementationV2 {
    /**
     * Tracks whether V1 has been initialized.
     * MUST match V1 storage layout (slot 0).
     */
    bool private _initialized;

    /**
     * Initial value from V1.
     * MUST match V1 storage layout (slot 1).
     */
    uint256 public initializedValue;

    /**
     * Tracks whether V2 initialization has been performed.
     * New storage slot (slot 2).
     */
    bool private _initializedV2;

    /**
     * New state variable introduced in V2.
     * Can be set via initializeV2() during upgradeAndCall.
     * New storage slot (slot 3).
     */
    uint256 public newState;

    /**
     * Error thrown when attempting to initialize V2 twice.
     */
    error AlreadyInitializedV2();

    /**
     * V2 initialization function.
     * Called during upgradeAndCall to set new state.
     * Includes guard to prevent double initialization.
     * @param _newState The value to set for newState
     */
    function initializeV2(uint256 _newState) external {
        if (_initializedV2) {
            revert AlreadyInitializedV2();
        }
        _initializedV2 = true;
        newState = _newState;
    }

    /**
     * Check if V2 has been initialized.
     * @return True if V2 initialized, false otherwise
     */
    function initializedV2() external view returns (bool) {
        return _initializedV2;
    }

    /**
     * Check if V1 was initialized (inherited from V1 storage).
     * @return True if V1 was initialized, false otherwise
     */
    function initialized() external view returns (bool) {
        return _initialized;
    }

    /**
     * New function only available in V2.
     * @return The current newState value
     */
    function getNewState() external view returns (uint256) {
        return newState;
    }

    /**
     * Returns the implementation version number.
     * @return Version identifier (2 for upgraded implementation)
     */
    function version() external pure returns (uint256) {
        return 2;
    }

    /**
     * Upgraded function with new behavior.
     * @return A test string indicating V2
     */
    function greet() external pure returns (string memory) {
        return "Hello from V2";
    }
}
