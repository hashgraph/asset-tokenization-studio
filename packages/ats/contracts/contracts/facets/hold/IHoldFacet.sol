// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldTypes } from "./IHoldTypes.sol";

import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
/// @custom:hash resolverKey Hold
bytes32 constant RESOLVER_KEY_HOLD = 0x7c2ef14067e573a8580a580634bd7547099c4b82cd9f36610da317d77eacf1f1;

/**
 * @title IHoldFacet
 * @notice Interface for the high-level, partition-agnostic hold read accessors.
 * @dev Defines the read surface of the `HoldFacet` diamond facet: the aggregate held balance for an
 *      account and the third party registered on a specific hold. Partition-scoped accessors remain on
 *      `IHoldByPartition`. Implementations are expected to honour `EvmAccessors` for adjusted
 *      balance reads so results stay consistent under time-travel tests.
 */
interface IHoldFacet is IHoldTypes {
    /**
     * @notice Emitted once when the hold capability is initialised on a token.
     * @dev Fires exclusively from `initializeHold`.
     */
    event HoldInitialized();

    /**
     * @notice Initialises the hold capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeHold() external;

    /**
     * @notice Returns the adjusted held amount for an account across every partition.
     * @dev The returned value reflects any balance adjustments applicable at the current timestamp.
     * @param _tokenHolder Address whose aggregate held balance is queried.
     * @return amount_ Sum of held balances across all partitions, adjusted to the current timestamp.
     */
    function getHeldAmountFor(address _tokenHolder) external view returns (uint256 amount_);

    /**
     * @notice Returns the third-party address registered on a given hold.
     * @dev Returns the zero address when no third party was registered for the hold (for example,
     *      holds created directly by the token holder, controller-issued holds, or unknown hold ids).
     * @param _holdIdentifier Tuple identifying the hold: partition, token holder and hold id.
     * @return thirdParty_ Address of the third party authorised for the hold, or zero if none.
     */
    function getHoldThirdParty(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier
    ) external view returns (address thirdParty_);
}
