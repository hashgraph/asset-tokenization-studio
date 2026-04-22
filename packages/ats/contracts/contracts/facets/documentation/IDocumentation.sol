// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IDocumentation
 * @notice Interface for on-chain document management, enabling attachment, removal,
 *         and retrieval of off-chain documents referenced by a unique `bytes32` name.
 * @dev Implementing contracts are expected to gate write operations behind role-based
 *      access control and pause checks. Storage is managed via a dedicated diamond
 *      storage slot (`_DOCUMENTATION_STORAGE_POSITION`) to avoid layout collisions.
 *      All function selectors are identical to those of the former `IERC1643` interface,
 *      preserving full ABI compatibility.
 * @author Hashgraph Asset Tokenization
 */
interface IDocumentation {
    /**
     * @notice Represents a single off-chain document referenced by the contract.
     * @param docHash   Keccak-256 hash of the document contents for integrity verification.
     * @param lastModified Unix timestamp of the most recent write operation on this entry.
     * @param uri       Off-chain location from which the document can be retrieved.
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
    struct DocumentationStorage {
        mapping(bytes32 => Document) documents;
        mapping(bytes32 => uint256) docIndexes;
        bytes32[] docNames;
    }

    /**
     * @notice Emitted when a document is permanently removed from the contract.
     * @param name         Unique identifier of the document that was removed.
     * @param uri          Off-chain URI that was associated with the document.
     * @param documentHash Content hash that was associated with the document.
     */
    event DocumentRemoved(bytes32 indexed name, string uri, bytes32 documentHash);

    /**
     * @notice Emitted when a document is created or its URI or hash is updated.
     * @param name         Unique identifier of the document that was set or updated.
     * @param uri          Off-chain URI now associated with the document.
     * @param documentHash Content hash now associated with the document.
     */
    event DocumentUpdated(bytes32 indexed name, string uri, bytes32 documentHash);

    /**
     * @notice Raised when `setDocument` is called with a zero-value document name.
     * @dev A `bytes32(0)` name is rejected to prevent silent collisions in storage.
     */
    error EmptyName();

    /**
     * @notice Raised when `setDocument` is called with an empty URI string.
     * @dev An empty URI would produce an unresolvable document reference.
     */
    error EmptyURI();

    /**
     * @notice Raised when `setDocument` is called with a zero-value document hash.
     * @dev A zero hash provides no integrity guarantee and is therefore disallowed.
     */
    error EmptyHASH();

    /**
     * @notice Raised when an operation targets a document name that has not been registered.
     * @param name The document name that could not be found in storage.
     */
    error DocumentDoesNotExist(bytes32 name);

    /**
     * @notice Attaches a new document to the contract or updates the URI and hash of an
     *         existing one.
     * @dev Requires the caller to hold `_DOCUMENTER_ROLE` and the token to be unpaused.
     *      If `_name` is not yet registered, it is appended to the `docNames` array and
     *      its index is recorded in `docIndexes`. Emits {DocumentUpdated}.
     * @param _name         Unique `bytes32` identifier for the document. Must not be zero.
     * @param _uri          Off-chain URI of the document. Must not be empty.
     * @param _documentHash Keccak-256 content hash of the document. Must not be zero.
     */
    function setDocument(bytes32 _name, string calldata _uri, bytes32 _documentHash) external;

    /**
     * @notice Removes an existing document from the contract.
     * @dev Requires the caller to hold `_DOCUMENTER_ROLE` and the token to be unpaused.
     *      Uses a swap-and-pop strategy to remove the entry from `docNames` in O(1),
     *      updating `docIndexes` accordingly. Emits {DocumentRemoved}.
     *      Reverts with {DocumentDoesNotExist} if `_name` is not registered.
     * @param _name Unique `bytes32` identifier of the document to remove.
     */
    function removeDocument(bytes32 _name) external;

    /**
     * @notice Returns the URI, content hash, and last-modified timestamp of a document.
     * @param _name Unique `bytes32` identifier of the document to query.
     * @return      Off-chain URI of the document.
     * @return      Keccak-256 content hash of the document.
     * @return      Unix timestamp of the last write operation on this document.
     */
    function getDocument(bytes32 _name) external view returns (string memory, bytes32, uint256);

    /**
     * @notice Returns the names of all documents currently attached to the contract.
     * @dev The returned array reflects the current contents of the `docNames` storage
     *      array; ordering may change when documents are removed via swap-and-pop.
     * @return Array of `bytes32` document names.
     */
    function getAllDocuments() external view returns (bytes32[] memory);
}
