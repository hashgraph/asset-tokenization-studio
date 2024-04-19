// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IERC1643 {
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

    // Document Management
    function getDocument(
        bytes32 _name
    ) external view returns (string memory, bytes32, uint256);

    function setDocument(
        bytes32 _name,
        string calldata _uri,
        bytes32 _documentHash
    ) external;

    function removeDocument(bytes32 _name) external;

    function getAllDocuments() external view returns (bytes32[] memory);

    error EmptyName();
    error EmptyURI();
    error EmptyHASH();
    error DocumentDoesNotExist(bytes32 name);
}
