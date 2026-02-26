// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC1594_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _ERC1643_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _ERC1644_STORAGE_POSITION } from "../constants/storagePositions.sol";

/// @dev ERC1594 issuance/redemption storage
struct ERC1594Storage {
    bool issuance;
    bool initialized;
}

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

/// @dev ERC1644 controller storage
struct ERC1644Storage {
    bool isControllable;
    bool initialized;
}

/// @dev Access ERC1594 issuance storage
function erc1594Storage() pure returns (ERC1594Storage storage erc1594_) {
    bytes32 pos = _ERC1594_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        erc1594_.slot := pos
    }
}

/// @dev Access ERC1643 document storage
function erc1643Storage() pure returns (ERC1643Storage storage erc1643_) {
    bytes32 pos = _ERC1643_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        erc1643_.slot := pos
    }
}

/// @dev Access ERC1644 controller storage
function erc1644Storage() pure returns (ERC1644Storage storage erc1644_) {
    bytes32 pos = _ERC1644_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        erc1644_.slot := pos
    }
}
