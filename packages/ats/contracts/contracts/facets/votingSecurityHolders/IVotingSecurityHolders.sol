// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IVotingSecurityHolders
 * @author Asset Tokenization Studio Team
 * @notice Interface for querying the set of security holders associated with a voting.
 * @dev Holder data is sourced from the snapshot taken at the voting record date when available;
 *      otherwise the current token-holder enumeration is used.
 *      Returns empty/zero when the record date has not yet been reached.
 */
interface IVotingSecurityHolders {
    /**
     * @notice Returns a paginated list of token holders eligible for a voting.
     * @dev Resolved from the snapshot at the voting record date when one exists; falls back to
     *      the live holder list if no snapshot has been taken.
     *      Returns an empty array if the record date has not yet been reached.
     * @param _voteID      Identifier of the target voting (1-based index).
     * @param _pageIndex   Zero-based page number for pagination.
     * @param _pageLength  Maximum number of addresses to return per page.
     * @return holders_    Ordered array of holder addresses for the requested page.
     */
    function getVotingHolders(
        uint256 _voteID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_);

    /**
     * @notice Returns the total number of token holders eligible for a voting.
     * @dev Count is taken from the snapshot at the voting record date when one exists; falls back
     *      to the live total if no snapshot has been taken.
     *      Returns zero if the record date has not yet been reached.
     * @param _voteID  Identifier of the target voting (1-based index).
     * @return totalHolders_  Total number of eligible holders.
     */
    function getTotalVotingHolders(uint256 _voteID) external view returns (uint256 totalHolders_);
}
