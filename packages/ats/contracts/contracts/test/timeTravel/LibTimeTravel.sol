// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _TIMESTAMP_OVERRIDE_SLOT, _BLOCK_NUMBER_OVERRIDE_SLOT } from "../../constants/storagePositions.sol";

/// @title LibTimeTravel
/// @notice Library for test-only timestamp and block number overrides using well-known storage slots.
/// @dev In production (non-Hardhat), the override slots are always 0 and native values are returned.
///      TimeTravelFacet writes to these slots during tests (chainId 1337 only).
library LibTimeTravel {
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
