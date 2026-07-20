// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IRevocationList
 * @author Asset Tokenization Studio Team
 * @notice Minimal interface for querying whether a verifiable credential issued to a subject
 *         has been revoked by its issuer.
 */
interface IRevocationList {
    /**
     * @notice Checks if the VC granted by an issuer to a subject has been revoked.
     * @param _subject The address of the subject whose credential is being queried.
     * @param _vcId The identifier of the verifiable credential to check.
     * @return True if the credential has been revoked, false otherwise.
     */
    function revoked(address _subject, string calldata _vcId) external view returns (bool);
}
