// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title LibTimeTravel
/// @notice Library for test-only timestamp and block number overrides using well-known storage slots.
/// @dev In production (non-Hardhat), the override slots are always 0 and native values are returned.
///      TimeTravelFacet writes to these slots during tests (chainId 1337 only).
library LibTimeTravel {
    // keccak256('security.token.standard.test.timetravel.timestamp')
    bytes32 private constant _TIMESTAMP_OVERRIDE_SLOT =
        0x6dffada92f87e08031a64f3c82fa9d9b647a47b516130bdc52f646d498adc7ef;

    // keccak256('security.token.standard.test.timetravel.blocknumber')
    bytes32 private constant _BLOCK_NUMBER_OVERRIDE_SLOT =
        0xda5cca5277b046f39c27835382b41b07ac714748d81f7c159fdbc36744ce094b;

    /// @notice Writes a timestamp override to the well-known slot. Only for TimeTravelFacet.
    function setTimestampOverride(uint256 value) internal {
        bytes32 slot = _TIMESTAMP_OVERRIDE_SLOT;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            sstore(slot, value)
        }
    }

    /// @notice Writes a block number override to the well-known slot. Only for TimeTravelFacet.
    function setBlockNumberOverride(uint256 value) internal {
        bytes32 slot = _BLOCK_NUMBER_OVERRIDE_SLOT;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            sstore(slot, value)
        }
    }

    /// @notice Returns block.timestamp, or the test override if set by TimeTravelFacet.
    function getBlockTimestamp() internal view returns (uint256) {
        uint256 override_;
        bytes32 slot = _TIMESTAMP_OVERRIDE_SLOT;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            override_ := sload(slot)
        }
        return override_ == 0 ? block.timestamp : override_;
    }

    /// @notice Returns block.number, or the test override if set by TimeTravelFacet.
    function getBlockNumber() internal view returns (uint256) {
        uint256 override_;
        bytes32 slot = _BLOCK_NUMBER_OVERRIDE_SLOT;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            override_ := sload(slot)
        }
        return override_ == 0 ? block.number : override_;
    }

    /// @notice Returns the raw timestamp override value (0 if not set). Used by TimeTravelFacet for events.
    function getTimestampOverride() internal view returns (uint256 override_) {
        bytes32 slot = _TIMESTAMP_OVERRIDE_SLOT;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            override_ := sload(slot)
        }
    }

    /// @notice Returns the raw block number override value (0 if not set). Used by TimeTravelFacet for events.
    function getBlockNumberOverride() internal view returns (uint256 override_) {
        bytes32 slot = _BLOCK_NUMBER_OVERRIDE_SLOT;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            override_ := sload(slot)
        }
    }
}
