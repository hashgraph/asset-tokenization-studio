// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IERC1643 {
    struct Document {
        bytes32 docHash; // Hash of the document
        uint256 lastModified; // Timestamp at which document details was last modified
        string uri; // URI of the document that exist off-chain
    }

    struct ERC1643Storage {
        // mapping to store the documents details in the document
        mapping(bytes32 => Document) documents;
        // mapping to store the document name indexes
        mapping(bytes32 => uint256) docIndexes;
        // Array use to store all the document name present in the contracts
        bytes32[] docNames;
    }

    // Document Events
    event DocumentRemoved(
        bytes32 indexed name,
        string uri,
        bytes32 documentHash
    );
    event DocumentUpdated(
        bytes32 indexed name,
        string uri,
        bytes32 documentHash
    );

    error EmptyName();
    error EmptyURI();
    error EmptyHASH();
    error DocumentDoesNotExist(bytes32 name);

    /**
     * @notice Used to attach a new document to the contract, or update the URI or hash of an existing attached document
     * @dev Can only be executed by the owner of the contract.
     * @param _name Name of the document. It should be unique always
     * @param _uri Off-chain uri of the document from where it is accessible to investors/advisors to read.
     * @param _documentHash hash (of the contents) of the document.
     */
    function setDocument(
        bytes32 _name,
        string calldata _uri,
        bytes32 _documentHash
    ) external;

    /**
     * @notice Used to remove an existing document from the contract by giving the name of the document.
     * @dev Can only be executed by the owner of the contract.
     * @param _name Name of the document. It should be unique always
     */
    function removeDocument(bytes32 _name) external;

    /**
     * @notice Used to return the details of a document with a known name (`bytes32`).
     * @param _name Name of the document
     * @return string The URI associated with the document.
     * @return bytes32 The hash (of the contents) of the document.
     * @return uint256 the timestamp at which the document was last modified.
     */
    function getDocument(
        bytes32 _name
    ) external view returns (string memory, bytes32, uint256);

    /**
     * @notice Used to retrieve a full list of documents attached to the smart contract.
     * @return bytes32 List of all documents names present in the contract.
     */
    function getAllDocuments() external view returns (bytes32[] memory);
}
