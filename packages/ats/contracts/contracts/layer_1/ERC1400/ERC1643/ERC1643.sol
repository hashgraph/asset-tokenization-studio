// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1643 } from "../../interfaces/ERC1400/IERC1643.sol";
import { _DOCUMENTER_ROLE } from "../../constants/roles.sol";
import { _ERC1643_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { Internals } from "../../../layer_0/Internals.sol";

abstract contract ERC1643 is IERC1643, Internals {
    function setDocument(
        bytes32 _name,
        string calldata _uri,
        bytes32 _documentHash
    ) external override onlyRole(_DOCUMENTER_ROLE) onlyUnpaused {
        if (_name == bytes32(0)) {
            revert EmptyName();
        }
        if (bytes(_uri).length == 0) {
            revert EmptyURI();
        }
        if (_documentHash == bytes32(0)) {
            revert EmptyHASH();
        }
        ERC1643Storage storage erc1643Storage = _erc1643Storage();
        if (erc1643Storage.documents[_name].lastModified == uint256(0)) {
            erc1643Storage.docNames.push(_name);
            erc1643Storage.docIndexes[_name] = erc1643Storage.docNames.length;
        }
        erc1643Storage.documents[_name] = Document(_documentHash, _blockTimestamp(), _uri);
        emit DocumentUpdated(_name, _uri, _documentHash);
    }

    function removeDocument(bytes32 _name) external override onlyRole(_DOCUMENTER_ROLE) onlyUnpaused {
        ERC1643Storage storage erc1643Storage = _erc1643Storage();
        if (erc1643Storage.documents[_name].lastModified == uint256(0)) {
            revert DocumentDoesNotExist(_name);
        }
        uint256 index = erc1643Storage.docIndexes[_name] - 1;
        if (index != erc1643Storage.docNames.length - 1) {
            erc1643Storage.docNames[index] = erc1643Storage.docNames[erc1643Storage.docNames.length - 1];
            erc1643Storage.docIndexes[erc1643Storage.docNames[index]] = index + 1;
        }
        erc1643Storage.docNames.pop();
        emit DocumentRemoved(_name, erc1643Storage.documents[_name].uri, erc1643Storage.documents[_name].docHash);
        delete erc1643Storage.documents[_name];
    }

    function getDocument(bytes32 _name) external view override returns (string memory, bytes32, uint256) {
        ERC1643Storage storage erc1643Storage = _erc1643Storage();
        return (
            erc1643Storage.documents[_name].uri,
            erc1643Storage.documents[_name].docHash,
            erc1643Storage.documents[_name].lastModified
        );
    }

    function getAllDocuments() external view override returns (bytes32[] memory) {
        return _erc1643Storage().docNames;
    }

    function _erc1643Storage() internal pure returns (ERC1643Storage storage erc1643Storage) {
        bytes32 position = _ERC1643_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc1643Storage.slot := position
        }
    }
}
