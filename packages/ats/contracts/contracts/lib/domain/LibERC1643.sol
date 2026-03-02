// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC1643_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IERC1643 } from "../../facets/features/interfaces/ERC1400/IERC1643.sol";

/// @dev Document details for ERC1643
struct IERC1643Document {
    bytes32 docHash;
    uint256 lastModified;
    string uri;
}

/// @dev ERC1643 document storage
struct ERC1643Storage {
    mapping(bytes32 => IERC1643Document) documents;
    mapping(bytes32 => uint256) docIndexes;
    bytes32[] docNames;
}

/// @title LibERC1643
/// @notice Library for ERC1643 document management
/// @dev Extracted from ERC1643.sol for library-based diamond migration
library LibERC1643 {
    function setDocument(bytes32 _name, string calldata _uri, bytes32 _documentHash) internal {
        if (_name == bytes32(0)) revert IERC1643.EmptyName();
        if (bytes(_uri).length == 0) revert IERC1643.EmptyURI();
        if (_documentHash == bytes32(0)) revert IERC1643.EmptyHASH();

        ERC1643Storage storage s = erc1643Storage();
        if (s.documents[_name].lastModified == 0) {
            s.docNames.push(_name);
            s.docIndexes[_name] = s.docNames.length;
        }
        s.documents[_name] = IERC1643Document(_documentHash, block.timestamp, _uri);
        emit IERC1643.DocumentUpdated(_name, _uri, _documentHash);
    }

    function removeDocument(bytes32 _name) internal {
        ERC1643Storage storage s = erc1643Storage();
        if (s.documents[_name].lastModified == 0) revert IERC1643.DocumentDoesNotExist(_name);

        uint256 index = s.docIndexes[_name] - 1;
        if (index != s.docNames.length - 1) {
            s.docNames[index] = s.docNames[s.docNames.length - 1];
            s.docIndexes[s.docNames[index]] = index + 1;
        }
        s.docNames.pop();
        emit IERC1643.DocumentRemoved(_name, s.documents[_name].uri, s.documents[_name].docHash);
        delete s.documents[_name];
    }

    function getDocument(bytes32 _name) internal view returns (string memory, bytes32, uint256) {
        ERC1643Storage storage s = erc1643Storage();
        return (s.documents[_name].uri, s.documents[_name].docHash, s.documents[_name].lastModified);
    }

    function getAllDocuments() internal view returns (bytes32[] memory) {
        return erc1643Storage().docNames;
    }

    /// @dev Access ERC1643 document storage
    function erc1643Storage() internal pure returns (ERC1643Storage storage erc1643_) {
        bytes32 pos = _ERC1643_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc1643_.slot := pos
        }
    }
}
