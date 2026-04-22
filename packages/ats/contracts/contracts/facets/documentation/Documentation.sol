// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDocumentation } from "./IDocumentation.sol";
import { _DOCUMENTER_ROLE } from "../../constants/roles.sol";
import { _DOCUMENTATION_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";

/**
 * @title Documentation
 * @notice Abstract implementation of `IDocumentation` providing full document
 *         lifecycle management — creation, update, removal, and retrieval — for
 *         security tokens built on the ATS Diamond architecture.
 * @dev Inherits `Modifiers` to enforce `onlyUnpaused` and `onlyRole` guards on
 *      all write operations. Storage is accessed via an isolated diamond storage
 *      slot (`_DOCUMENTATION_STORAGE_POSITION`) to prevent layout collisions with
 *      other facets. The `lastModified` timestamp is resolved through
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
     *      If `_name` has no prior entry (`lastModified == 0`), the name is appended
     *      to `docNames` and its one-based index is stored in `docIndexes`. On update,
     *      only the `Document` record is overwritten; the index and name array are
     *      unchanged. Emits {DocumentUpdated}.
     * @param _name         Unique `bytes32` identifier for the document. Must not be zero.
     * @param _uri          Off-chain URI of the document. Must not be empty.
     * @param _documentHash Keccak-256 content hash of the document. Must not be zero.
     */
    function setDocument(
        bytes32 _name,
        string calldata _uri,
        bytes32 _documentHash
    ) external override onlyUnpaused onlyRole(_DOCUMENTER_ROLE) {
        if (_name == bytes32(0)) {
            revert EmptyName();
        }
        if (bytes(_uri).length == 0) {
            revert EmptyURI();
        }
        if (_documentHash == bytes32(0)) {
            revert EmptyHASH();
        }
        DocumentationStorage storage docStorage = _documentationStorage();
        if (docStorage.documents[_name].lastModified == uint256(0)) {
            docStorage.docNames.push(_name);
            docStorage.docIndexes[_name] = docStorage.docNames.length;
        }
        docStorage.documents[_name] = Document(_documentHash, TimeTravelStorageWrapper.getBlockTimestamp(), _uri);
        emit DocumentUpdated(_name, _uri, _documentHash);
    }

    /**
     * @notice Removes an existing document from the token.
     * @dev Restricted to accounts holding `_DOCUMENTER_ROLE` on an unpaused token.
     *      Applies a swap-and-pop strategy: the last element of `docNames` is moved
     *      into the vacated position and `docIndexes` is updated accordingly, keeping
     *      the operation O(1). The `documents` mapping entry is deleted after the
     *      event is emitted to avoid reading zeroed storage in the event data.
     *      Reverts with {DocumentDoesNotExist} if `_name` is not registered.
     *      Emits {DocumentRemoved}.
     * @param _name Unique `bytes32` identifier of the document to remove.
     */
    function removeDocument(bytes32 _name) external override onlyUnpaused onlyRole(_DOCUMENTER_ROLE) {
        DocumentationStorage storage docStorage = _documentationStorage();
        if (docStorage.documents[_name].lastModified == uint256(0)) {
            revert DocumentDoesNotExist(_name);
        }
        uint256 index = docStorage.docIndexes[_name] - 1;
        if (index != docStorage.docNames.length - 1) {
            docStorage.docNames[index] = docStorage.docNames[docStorage.docNames.length - 1];
            docStorage.docIndexes[docStorage.docNames[index]] = index + 1;
        }
        docStorage.docNames.pop();
        emit DocumentRemoved(_name, docStorage.documents[_name].uri, docStorage.documents[_name].docHash);
        delete docStorage.documents[_name];
    }

    /**
     * @notice Returns the URI, content hash, and last-modified timestamp of a document.
     * @param _name Unique `bytes32` identifier of the document to query.
     * @return      Off-chain URI of the document.
     * @return      Keccak-256 content hash of the document.
     * @return      Unix timestamp of the last write to this document entry.
     */
    function getDocument(bytes32 _name) external view override returns (string memory, bytes32, uint256) {
        DocumentationStorage storage docStorage = _documentationStorage();
        return (
            docStorage.documents[_name].uri,
            docStorage.documents[_name].docHash,
            docStorage.documents[_name].lastModified
        );
    }

    /**
     * @notice Returns the names of all documents currently attached to the token.
     * @dev Ordering reflects the internal `docNames` array and may change when
     *      documents are removed via swap-and-pop.
     * @return Array of `bytes32` document names.
     */
    function getAllDocuments() external view override returns (bytes32[] memory) {
        return _documentationStorage().docNames;
    }

    /**
     * @notice Resolves the diamond storage slot for the documentation domain.
     * @dev Uses inline assembly to assign the slot directly from
     *      `_DOCUMENTATION_STORAGE_POSITION`, ensuring no overlap with other facets.
     * @return docStorage Reference to the `DocumentationStorage` struct in diamond storage.
     */
    function _documentationStorage() internal pure returns (DocumentationStorage storage docStorage) {
        bytes32 position = _DOCUMENTATION_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            docStorage.slot := position
        }
    }
}
