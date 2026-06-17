// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IVotes
 * @author Asset Tokenization Studio Team
 * @notice Common interface for vote-delegation and vote-weight queries on ERC-20 and ERC-721
 *         tokens that implement on-chain governance weight tracking.
 * @dev Common interface for {ERC20Votes}, {ERC721Votes}, and other {Votes}-enabled contracts.
 *
 * _Available since v4.5._
 */
interface IVotes {
    /**
     * @notice Delegates the caller's voting power to `delegatee`.
     * @dev Delegates votes from the sender to `delegatee`.
     * @param delegatee Address that will receive the caller's voting power.
     */
    function delegate(address delegatee) external;

    /**
     * @notice Returns the current vote weight of `account`.
     * @dev Returns the current amount of votes that `account` has.
     * @param account Address whose current vote weight is queried.
     * @return Current vote weight of `account`.
     */
    function getVotes(address account) external view returns (uint256);

    /**
     * @notice Returns the vote weight of `account` at a past `timepoint`.
     * @dev Returns the amount of votes that `account` had at a specific moment in the past. If the `clock()` is
     * configured to use block numbers, this will return the value at the end of the corresponding block.
     * @param account Address whose historical vote weight is queried.
     * @param timepoint Block number or timestamp at which the weight is resolved.
     * @return Vote weight of `account` at `timepoint`.
     */
    function getPastVotes(address account, uint256 timepoint) external view returns (uint256);

    /**
     * @notice Returns the total vote supply available at a past `timepoint`.
     * @dev Returns the total supply of votes available at a specific moment in the past. If the `clock()` is
     * configured to use block numbers, this will return the value at the end of the corresponding block.
     *
     * NOTE: This value is the sum of all available votes, which is not necessarily the sum of all delegated votes.
     * Votes that have not been delegated are still part of total supply, even though they would not participate in a
     * vote.
     * @param timepoint Block number or timestamp at which the total supply is resolved.
     * @return Total vote supply at `timepoint`.
     */
    function getPastTotalSupply(uint256 timepoint) external view returns (uint256);

    /**
     * @notice Returns the delegate address that `account` has chosen.
     * @dev Returns the delegate that `account` has chosen.
     * @param account Address whose chosen delegate is queried.
     * @return Address of the delegate chosen by `account`.
     */
    function delegates(address account) external view returns (address);
}
