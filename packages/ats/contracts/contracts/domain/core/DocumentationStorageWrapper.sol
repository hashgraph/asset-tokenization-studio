// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _DOCUMENTATION_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IDocumentation } from "../../facets/documentation/IDocumentation.sol";

/**
 * @notice Represents a single off-chain document referenced by the contract.
 * @param docHash      Keccak-256 hash of the document contents for integrity verification.
 * @param lastModified Unix timestamp of the most recent write operation on this entry.
 * @param uri          Off-chain location from which the document can be retrieved.
 */
struct Document {
    bytes32 docHash;
    uint256 lastModified;
    string uri;
}

/**
 * @notice Diamond storage layout for the documentation domain.
 * @param documents  Mapping from document name to its `Document` record.
 * @param docIndexes Mapping from document name to its one-based position in `docNames`,
 *                   used for O(1) existence checks and swap-and-pop removal.
 * @param docNames   Ordered array of all registered document names; maintains the
 *                   enumerable set of active documents.
 */
struct DocumentationDataStorage {
    mapping(bytes32 => Document) documents;
    mapping(bytes32 => uint256) docIndexes;
    bytes32[] docNames;
}

/**
 * @title DocumentationStorageWrapper
 * @notice Library providing diamond storage access and all read/write operations for
 *         the documentation domain.
 * @dev Uses the ERC-2535 diamond storage pattern to isolate state under
 *      `_DOCUMENTATION_STORAGE_POSITION`. The raw storage getter is `private` so that
 *      all storage access from external contracts is channelled through the library's
 *      typed API, preventing uncontrolled direct slot manipulation.
 *      All public-facing functions are `internal` so they inline into callers without
 *      an external call overhead.
 * @author Hashgraph Asset Tokenization
 */
library DocumentationStorageWrapper {
    // -------------------------------------------------------------------------
    // Write operations
    // -------------------------------------------------------------------------

    /**
     * @notice Creates a new document entry or overwrites the URI and hash of an
     *         existing one.
     * @dev If `_name` has no prior entry (`lastModified == 0`), the name is appended
     *      to `docNames` and its one-based index is stored in `docIndexes`. On update,
     *      only the `Document` record is overwritten; the index and name array are
     *      unchanged.
     * @param _name         Unique `bytes32` identifier for the document.
     * @param _documentHash Keccak-256 content hash of the document.
     * @param _timestamp    Unix timestamp to record as `lastModified`.
     * @param _uri          Off-chain URI of the document.
     */
    function setDocumentEntry(bytes32 _name, bytes32 _documentHash, uint256 _timestamp, string calldata _uri) internal {
        DocumentationDataStorage storage docStorage = _documentationStorage();
        if (docStorage.documents[_name].lastModified == uint256(0)) {
            docStorage.docNames.push(_name);
            docStorage.docIndexes[_name] = docStorage.docNames.length;
        }
        docStorage.documents[_name] = Document(_documentHash, _timestamp, _uri);
    }

    /**
     * @notice Removes an existing document entry using a swap-and-pop strategy.
     * @dev The URI and hash are captured before deletion and returned so that the
     *      caller can emit `DocumentRemoved` with the correct values.
     *      Swap-and-pop runs in O(1) by replacing the removed element with the last
     *      element of `docNames` and updating `docIndexes` accordingly.
     * @param _name Unique `bytes32` identifier of the document to remove.
     * @return uri_     Off-chain URI that was associated with the document.
     * @return docHash_ Content hash that was associated with the document.
     */
    function removeDocumentEntry(bytes32 _name) internal returns (string memory uri_, bytes32 docHash_) {
        DocumentationDataStorage storage docStorage = _documentationStorage();
        uri_ = docStorage.documents[_name].uri;
        docHash_ = docStorage.documents[_name].docHash;
        uint256 index = docStorage.docIndexes[_name] - 1;
        if (index != docStorage.docNames.length - 1) {
            docStorage.docNames[index] = docStorage.docNames[docStorage.docNames.length - 1];
            docStorage.docIndexes[docStorage.docNames[index]] = index + 1;
        }
        docStorage.docNames.pop();
        delete docStorage.documents[_name];
    }

    // -------------------------------------------------------------------------
    // Read operations
    // -------------------------------------------------------------------------

    /**
     * @notice Returns the URI, content hash, and last-modified timestamp of a document.
     * @param _name Unique `bytes32` identifier of the document to query.
     * @return uri_          Off-chain URI of the document.
     * @return docHash_      Keccak-256 content hash of the document.
     * @return lastModified_ Unix timestamp of the last write to this document entry.
     */
    function getDocumentData(
        bytes32 _name
    ) internal view returns (string memory uri_, bytes32 docHash_, uint256 lastModified_) {
        DocumentationDataStorage storage docStorage = _documentationStorage();
        uri_ = docStorage.documents[_name].uri;
        docHash_ = docStorage.documents[_name].docHash;
        lastModified_ = docStorage.documents[_name].lastModified;
    }

    /**
     * @notice Returns the names of all documents currently registered.
     * @dev Ordering reflects the internal `docNames` array and may change when
     *      documents are removed via swap-and-pop.
     * @return Array of `bytes32` document names.
     */
    function getDocumentNames() internal view returns (bytes32[] memory) {
        return _documentationStorage().docNames;
    }

    // -------------------------------------------------------------------------
    // Validation checks (called by DocumentationModifiers)
    // -------------------------------------------------------------------------

    /**
     * @notice Reverts when `_name` has not been registered.
     * @dev Uses `lastModified == 0` as the absence sentinel, consistent with the
     *      storage default for unmapped entries.
     * @param _name The `bytes32` document name whose existence is asserted.
     */
    function checkDocumentExists(bytes32 _name) internal view {
        if (_documentationStorage().documents[_name].lastModified == uint256(0)) {
            revert IDocumentation.DocumentDoesNotExist(_name);
        }
    }

    /**
     * @notice Reverts when `_name` is the zero value.
     * @param _name The `bytes32` document name to validate.
     */
    function checkNotEmptyName(bytes32 _name) internal pure {
        if (_name == bytes32(0)) revert IDocumentation.EmptyName();
    }

    /**
     * @notice Reverts when `_uri` is an empty string.
     * @param _uri The URI string to validate.
     */
    function checkNotEmptyURI(string calldata _uri) internal pure {
        if (bytes(_uri).length == 0) revert IDocumentation.EmptyURI();
    }

    /**
     * @notice Reverts when `_documentHash` is the zero value.
     * @param _documentHash The `bytes32` content hash to validate.
     */
    function checkNotEmptyHash(bytes32 _documentHash) internal pure {
        if (_documentHash == bytes32(0)) revert IDocumentation.EmptyHASH();
    }

    // -------------------------------------------------------------------------
    // Private storage accessor
    // -------------------------------------------------------------------------

    /**
     * @notice Returns the diamond storage reference for the documentation domain.
     * @dev Private visibility enforces that all storage access goes through this
     *      library's typed API rather than direct slot manipulation by callers.
     * @return docStorage_ Reference to the `DocumentationStorage` struct.
     */
    function _documentationStorage() private pure returns (DocumentationDataStorage storage docStorage_) {
        bytes32 position = _DOCUMENTATION_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            docStorage_.slot := position
        }
    }
}
