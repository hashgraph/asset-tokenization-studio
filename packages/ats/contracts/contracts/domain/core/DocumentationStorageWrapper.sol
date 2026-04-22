// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _DOCUMENTATION_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IDocumentation } from "../../facets/documentation/IDocumentation.sol";

/**
 * @title DocumentationStorageWrapper
 * @notice Library providing diamond storage access and validation checks for the
 *         documentation domain.
 * @dev Uses the ERC-2535 diamond storage pattern to isolate state under
 *      `_DOCUMENTATION_STORAGE_POSITION`. All `_check*` functions are internal so
 *      they inline into callers without an external call; they revert directly with
 *      the custom errors declared in `IDocumentation`.
 * @author Hashgraph Asset Tokenization
 */
library DocumentationStorageWrapper {
    /**
     * @notice Reverts when `_name` has not been registered.
     * @dev Uses `lastModified == 0` as the absence sentinel, consistent with the
     *      storage default for unmapped entries.
     * @param _name The `bytes32` document name whose existence is asserted.
     */
    function _checkDocumentExists(bytes32 _name) internal view {
        if (documentationStorage().documents[_name].lastModified == uint256(0)) {
            revert IDocumentation.DocumentDoesNotExist(_name);
        }
    }

    /**
     * @notice Returns the diamond storage reference for the documentation domain.
     * @dev Uses inline assembly to assign the slot directly from
     *      `_DOCUMENTATION_STORAGE_POSITION`, preventing layout collisions with
     *      other facets.
     * @return docStorage_ Reference to the `DocumentationStorage` struct.
     */
    function documentationStorage() internal pure returns (IDocumentation.DocumentationStorage storage docStorage_) {
        bytes32 position = _DOCUMENTATION_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            docStorage_.slot := position
        }
    }

    /**
     * @notice Reverts when `_name` is the zero value.
     * @dev A `bytes32(0)` name is rejected to prevent silent collisions in storage.
     * @param _name The `bytes32` document name to validate.
     */
    function _checkNotEmptyName(bytes32 _name) internal pure {
        if (_name == bytes32(0)) revert IDocumentation.EmptyName();
    }

    /**
     * @notice Reverts when `_uri` is an empty string.
     * @dev An empty URI would produce an unresolvable document reference.
     * @param _uri The URI string to validate.
     */
    function _checkNotEmptyURI(string calldata _uri) internal pure {
        if (bytes(_uri).length == 0) revert IDocumentation.EmptyURI();
    }

    /**
     * @notice Reverts when `_documentHash` is the zero value.
     * @dev A zero hash provides no integrity guarantee and is therefore disallowed.
     * @param _documentHash The `bytes32` content hash to validate.
     */
    function _checkNotEmptyHash(bytes32 _documentHash) internal pure {
        if (_documentHash == bytes32(0)) revert IDocumentation.EmptyHASH();
    }
}
