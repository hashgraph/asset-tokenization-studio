// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1643Storage, IERC1643Document, erc1643Storage } from "../../storage/TokenStorage.sol";
import { IERC1643 } from "../../facets/features/interfaces/ERC1400/IERC1643.sol";

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
}
