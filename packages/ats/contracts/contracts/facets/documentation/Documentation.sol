// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDocumentation } from "./IDocumentation.sol";
import { DOCUMENTER_ROLE, DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { DocumentationStorageWrapper } from "../../domain/core/DocumentationStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { _DOCUMENTATION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title Documentation
 * @notice Manages the lifecycle and retrieval of token-related documentation.
 * @dev Provides the abstract implementation of `IDocumentation` for diamond facets.
 *      Write operations require an operational, activated and unpaused token, and are
 *      restricted to authorised documenters. Document data is persisted through
 *      `DocumentationStorageWrapper`, while timestamps are resolved through
 *      `TimeTravelStorageWrapper` to support deterministic test execution.
 * @author Hashgraph Asset Tokenization
 */
abstract contract Documentation is IDocumentation, Modifiers {
    /// @inheritdoc IDocumentation
    /// @dev Registers this facet as ready and emits `DocumentationInitialized`.
    function initializeDocumentation()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(_DOCUMENTATION_RESOLVER_KEY)
    {
        InitializerStorageWrapper.setFacetToReady(_DOCUMENTATION_RESOLVER_KEY);
        emit DocumentationInitialized();
    }

    /// @inheritdoc IDocumentation
    /// @dev Requires `DOCUMENTER_ROLE`, an operational and activated token, and a
    ///      non-empty name, URI and hash. Emits `DocumentUpdated`.
    function setDocument(
        bytes32 _name,
        string calldata _uri,
        bytes32 _documentHash
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(DOCUMENTER_ROLE)
        notEmptyName(_name)
        notEmptyURI(_uri)
        notEmptyHash(_documentHash)
    {
        DocumentationStorageWrapper.setDocumentEntry(
            _name,
            _documentHash,
            TimeTravelStorageWrapper.getBlockTimestamp(),
            _uri
        );
        emit DocumentUpdated(_name, _uri, _documentHash);
    }

    /// @inheritdoc IDocumentation
    /// @dev Requires `DOCUMENTER_ROLE` and an existing document on an operational,
    ///      activated and unpaused token. Emits `DocumentRemoved`.
    function removeDocument(
        bytes32 _name
    ) external override onlyOperational onlyActivated onlyUnpaused onlyRole(DOCUMENTER_ROLE) documentExists(_name) {
        (string memory uri, bytes32 docHash) = DocumentationStorageWrapper.removeDocumentEntry(_name);
        emit DocumentRemoved(_name, uri, docHash);
    }

    /// @inheritdoc IDocumentation
    function getDocument(bytes32 _name) external view override returns (string memory, bytes32, uint256) {
        return DocumentationStorageWrapper.getDocumentData(_name);
    }

    /// @inheritdoc IDocumentation
    /// @dev The returned ordering follows storage order and may change after removals.
    function getAllDocuments() external view override returns (bytes32[] memory) {
        return DocumentationStorageWrapper.getDocumentNames();
    }
}
