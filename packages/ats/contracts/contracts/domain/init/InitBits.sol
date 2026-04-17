// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICommonErrors } from "../../infrastructure/errors/ICommonErrors.sol";

/**
 * @title InitBits
 * @notice Shared bit-math for per-domain initialization tracking.
 * @dev InitBitmap is a User-Defined Value Type around uint256 — primitive at the
 *      storage level (one slot, spec-guaranteed-can-never-grow), type-distinct at
 *      the Solidity level so a bitmap can never be confused with a balance or
 *      timestamp. `using InitBits for InitBitmap global` makes the methods
 *      available anywhere InitBitmap is used.
 *
 *      Bits are claimed per domain in the matching constants/initBits/*.sol file.
 *      Bits are APPEND-ONLY — never renumber, never reuse. Removed fields leave
 *      their bits as permanent history on older tokens; new code simply never
 *      checks them.
 *
 *      Reads are free composition: `myBitmap.isInitialized(mask)`.
 *      Writes return a new value: `s.myBitmap = s.myBitmap.markInitialized(mask)`.
 * @author Asset Tokenization Studio Team
 */
type InitBitmap is uint256;

library InitBits {
    function isInitialized(InitBitmap b, uint256 mask) internal pure returns (bool) {
        return (InitBitmap.unwrap(b) & mask) == mask;
    }

    function isAnyInitialized(InitBitmap b, uint256 mask) internal pure returns (bool) {
        return (InitBitmap.unwrap(b) & mask) != 0;
    }

    function markInitialized(InitBitmap b, uint256 mask) internal pure returns (InitBitmap) {
        return InitBitmap.wrap(InitBitmap.unwrap(b) | mask);
    }

    function requireNotInitialized(InitBitmap b, uint256 mask) internal pure {
        if ((InitBitmap.unwrap(b) & mask) != 0) revert ICommonErrors.AlreadyInitialized();
    }
}

using InitBits for InitBitmap global;
