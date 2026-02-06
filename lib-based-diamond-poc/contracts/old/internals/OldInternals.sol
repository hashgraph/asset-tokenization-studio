// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./PauseInternal.sol";
import "./AccessInternal.sol";
import "./TokenInternal.sol";

/**
 * OLD ARCHITECTURE - The "Inheritance Monster"
 *
 * This is the heart of the problem with inheritance-based facets.
 * Every facet that needs ANY of these features must inherit from this,
 * causing ALL the code to be compiled into EVERY facet.
 *
 * Problems demonstrated:
 * 1. A facet that only needs pause checking still gets ALL token logic
 * 2. A facet that only needs minting still gets ALL access control logic
 * 3. The inheritance chain grows with every new feature
 * 4. Finding where logic lives requires tracing through multiple files
 * 5. Modifying one internal affects ALL facets (recompile everything)
 */
abstract contract OldInternals is PauseInternal, AccessInternal, TokenInternal {
    // This contract inherits EVERYTHING from all three internals.
    // Any facet inheriting this gets ~300+ lines of compiled bytecode
    // even if it only uses 1 function.

    // In a real system, this would also include:
    // - CapInternal
    // - SupplyScheduleInternal
    // - SnapshotInternal
    // - ComplianceInternal
    // - DocumentInternal
    // - LockInternal
    // - ... and many more

    // Each new Internal added here:
    // 1. Increases bytecode of ALL facets
    // 2. Increases compilation time
    // 3. Makes the inheritance tree harder to understand
    // 4. Creates potential for naming conflicts
}
