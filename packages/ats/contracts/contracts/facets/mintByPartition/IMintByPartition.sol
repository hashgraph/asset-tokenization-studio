// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Types } from "../layer_1/ERC1400/ERC1410/IERC1410Types.sol";

/**
 * @title IMintByPartition
 * @author Asset Tokenization Studio Team
 * @notice Interface for the partition-aware token issuance entry point of the ATS Diamond.
 * @dev Exposes `issueByPartition` which follows the ERC-1410 standard for issuing tokens
 *      into a specific partition. The operation requires the caller to hold either the issuer
 *      or agent role, honours max-supply and per-partition supply checks, and emits the
 *      `IssuedByPartition` event from `IERC1410Types`.
 */
interface IMintByPartition {
    /**
     * @notice Issues tokens to a specific partition for a token holder.
     * @dev Restricted to issuer or agent roles. Increases the total supply and the partition
     *      supply and emits `IssuedByPartition`. Only callable when the token is unpaused;
     *      in single-partition mode only the default partition is accepted. The destination
     *      must pass identity and compliance checks.
     * @param _issueData Struct containing the target partition, token holder address, token
     *        amount (in base units), and an arbitrary data payload for off-chain consumers.
     */
    function issueByPartition(IERC1410Types.IssueData calldata _issueData) external;
}
