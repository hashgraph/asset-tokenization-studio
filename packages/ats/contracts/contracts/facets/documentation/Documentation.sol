// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDocumentation } from "./IDocumentation.sol";
import { _DOCUMENTER_ROLE } from "../../constants/roles.sol";
import { DocumentationStorageWrapper } from "../../domain/core/DocumentationStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";

/**
 * @title Documentation
 * @notice Abstract implementation of `IDocumentation` providing full document
 *         lifecycle management — creation, update, removal, and retrieval — for
 *         security tokens built on the ATS Diamond architecture.
 * @dev Inherits `Modifiers` to enforce `onlyUnpaused`, `onlyRole`, and documentation
 *      validation guards on all write operations. Storage is accessed exclusively
 *      through `DocumentationStorageWrapper`'s typed API; the raw storage slot is
 *      private to that library, preventing uncontrolled direct slot manipulation.
 *      The `lastModified` timestamp is resolved through
 *      `TimeTravelStorageWrapper.getBlockTimestamp()`, enabling deterministic
 *      behaviour in test environments without altering production semantics.
 *      Designed to be inherited exclusively by `DocumentationFacet`.
 * @author Hashgraph Asset Tokenization
 */
abstract contract Documentation is IDocumentation, Modifiers {
    /**
     * @notice Attaches a new document to the token or updates the URI and hash of an
     *         existing one.
     * @dev Restricted to accounts holding `_DOCUMENTER_ROLE` on an unpaused token.
     *      If `_name` has no prior entry, it is appended to the enumerable set.
     *      On update, only the `Document` record is overwritten. Emits {DocumentUpdated}.
     * @param _name         Unique `bytes32` identifier for the document. Must not be zero.
     * @param _uri          Off-chain URI of the document. Must not be empty.
     * @param _documentHash Keccak-256 content hash of the document. Must not be zero.
     */
    function setDocument(
        bytes32 _name,
        string calldata _uri,
        bytes32 _documentHash
    )
        external
        override
        onlyUnpaused
        onlyRole(_DOCUMENTER_ROLE)
        notEmptyName(_name)
        notEmptyURI(_uri)
        notEmptyHash(_documentHash)
    {
        DocumentationStorageWrapper.setDocumentEntry(
            _name,
            _documentHash,
            TimeTravelStorageWrapper.getBlockTimestamp(),
            _uri
        );
        emit DocumentUpdated(_name, _uri, _documentHash);
    }

    /**
     * @notice Removes an existing document from the token.
     * @dev Restricted to accounts holding `_DOCUMENTER_ROLE` on an unpaused token.
     *      Uses a swap-and-pop strategy to remove the entry from `docNames` in O(1).
     *      Reverts with {DocumentDoesNotExist} if `_name` is not registered.
     *      Emits {DocumentRemoved}.
     * @param _name Unique `bytes32` identifier of the document to remove.
     */
    function removeDocument(
        bytes32 _name
    ) external override onlyUnpaused onlyRole(_DOCUMENTER_ROLE) documentExists(_name) {
        (string memory uri, bytes32 docHash) = DocumentationStorageWrapper.removeDocumentEntry(_name);
        emit DocumentRemoved(_name, uri, docHash);
    }

    /**
     * @notice Returns the URI, content hash, and last-modified timestamp of a document.
     * @param _name Unique `bytes32` identifier of the document to query.
     * @return      Off-chain URI of the document.
     * @return      Keccak-256 content hash of the document.
     * @return      Unix timestamp of the last write to this document entry.
     */
    function getDocument(bytes32 _name) external view override returns (string memory, bytes32, uint256) {
        return DocumentationStorageWrapper.getDocumentData(_name);
    }

    /**
     * @notice Returns the names of all documents currently attached to the token.
     * @dev Ordering reflects the internal `docNames` array and may change when
     *      documents are removed via swap-and-pop.
     * @return Array of `bytes32` document names.
     */
    function getAllDocuments() external view override returns (bytes32[] memory) {
        return DocumentationStorageWrapper.getDocumentNames();
    }
}
