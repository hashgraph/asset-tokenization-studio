// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { DocumentationStorageWrapper } from "../../domain/core/DocumentationStorageWrapper.sol";

/**
 * @title DocumentationModifiers
 * @notice Abstract contract providing input and existence modifiers for the
 *         documentation domain.
 * @dev All modifiers delegate to `DocumentationStorageWrapper._check*()` functions,
 *      following the project-wide `_check*` pattern for consistent revert behaviour.
 * @author Hashgraph Asset Tokenization
 */
abstract contract DocumentationModifiers {
    /**
     * @notice Reverts when the document name is the zero value.
     * @param _name The `bytes32` document name to validate.
     */
    modifier notEmptyName(bytes32 _name) {
        DocumentationStorageWrapper.checkNotEmptyName(_name);
        _;
    }

    /**
     * @notice Reverts when the document URI is an empty string.
     * @param _uri The URI string to validate.
     */
    modifier notEmptyURI(string calldata _uri) {
        DocumentationStorageWrapper.checkNotEmptyURI(_uri);
        _;
    }

    /**
     * @notice Reverts when the document hash is the zero value.
     * @param _documentHash The `bytes32` content hash to validate.
     */
    modifier notEmptyHash(bytes32 _documentHash) {
        DocumentationStorageWrapper.checkNotEmptyHash(_documentHash);
        _;
    }

    /**
     * @notice Reverts when the targeted document has not been registered.
     * @param _name The `bytes32` document name whose existence is asserted.
     */
    modifier documentExists(bytes32 _name) {
        DocumentationStorageWrapper.checkDocumentExists(_name);
        _;
    }
}
