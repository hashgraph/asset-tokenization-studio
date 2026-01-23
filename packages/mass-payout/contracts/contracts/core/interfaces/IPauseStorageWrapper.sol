// SPDX-License-Identifier: Apache-2.0

// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

interface IPauseStorageWrapper {
    /**
     * @dev Emitted when the LifeCycleCashFlow contract is paused
     *
     * @param operator The caller of the function that emitted the event
     */
    event LifeCycleCashFlowPaused(address indexed operator);

    /**
     * @dev Emitted when the LifeCycleCashFlow contract is unpaused
     *
     * @param operator The caller of the function that emitted the event
     */
    event LifeCycleCashFlowUnpaused(address indexed operator);

    /**
     * @dev Emitted when the LifeCycleCashFlow contract is paused and it should not
     *
     */
    error LifeCycleCashFlowIsPaused();

    /**
     * @dev Emitted when the LifeCycleCashFlow contract is unpaused and it should not
     *
     */
    error LifeCycleCashFlowIsUnpaused();
}
