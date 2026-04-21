// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1643 } from "./IERC1643.sol";
import { _DOCUMENTER_ROLE } from "../../../../constants/roles.sol";
import { _ERC1643_STORAGE_POSITION } from "../../../../constants/storagePositions.sol";
import { TimeTravelStorageWrapper } from "../../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { Modifiers } from "../../../../services/Modifiers.sol";

/**
 * @title  ERC1643
 * @notice Abstract implementation of the ERC1643 on-chain document management standard
 *         for security tokens, enabling authorised parties to register, update, and
 *         remove verified document references associated with a token.
 * @dev    Implements `IERC1643` and inherits `Modifiers` for access control and pause
 *         guards. Storage is anchored at `_ERC1643_STORAGE_POSITION` following the
 *         ERC-2535 Diamond Storage Pattern, as accessed via `_erc1643Storage`.
 *
 *         All mutating operations require the caller to hold `_DOCUMENTER_ROLE` and
 *         the contract to be unpaused. The document name registry (`docNames`) is
 *         maintained as an append-only array with a parallel index mapping
 *         (`docIndexes`) using one-based indices to distinguish an unregistered name
 *         (index `0`) from the first array position.
 *
 *         Block timestamps are sourced from `TimeTravelStorageWrapper` to support
 *         test-environment time manipulation without affecting production logic.
 *
 *         Inheriting contracts must not declare storage variables that could collide
 *         with `_ERC1643_STORAGE_POSITION`; all document state is encapsulated within
 *         `ERC1643Storage`.
 * @author Hashgraph
 */
abstract contract ERC1643 is IERC1643, Modifiers {
    /**
     * @notice Registers a new document or updates an existing one identified by `_name`,
     *         recording its URI, content hash, and the current block timestamp as the
     *         last-modified time.
     * @dev    Requires `_DOCUMENTER_ROLE` and an unpaused state. Reverts with
     *         `EmptyName` if `_name` is `bytes32(0)`, `EmptyURI` if `_uri` is empty, or
     *         `EmptyHASH` if `_documentHash` is `bytes32(0)`. When `_name` is new (i.e.
     *         `lastModified == 0`), the name is appended to `docNames` and a one-based
     *         index is recorded in `docIndexes`. Subsequent calls for the same `_name`
     *         overwrite the document record without modifying the name registry. The
     *         `lastModified` timestamp is always set to the current block timestamp via
     *         `TimeTravelStorageWrapper`.
     *         Emits: `IERC1643.DocumentUpdated`.
     * @param _name          `bytes32` identifier for the document; must be non-zero.
     * @param _uri           URI string pointing to the off-chain document; must be
     *                       non-empty.
     * @param _documentHash  Content hash of the document for integrity verification;
     *                       must be non-zero.
     */
    function setDocument(
        bytes32 _name,
        string calldata _uri,
        bytes32 _documentHash
    ) external override onlyUnpaused onlyRole(_DOCUMENTER_ROLE) {
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
        erc1643Storage.documents[_name] = Document(_documentHash, TimeTravelStorageWrapper.getBlockTimestamp(), _uri);
        emit DocumentUpdated(_name, _uri, _documentHash);
    }

    /**
     * @notice Removes an existing document identified by `_name` from the registry and
     *         deletes its stored data.
     * @dev    Requires `_DOCUMENTER_ROLE` and an unpaused state. Reverts with
     *         `DocumentDoesNotExist` if `_name` has no stored document (i.e.
     *         `lastModified == 0`). Uses a swap-and-pop strategy on `docNames` to
     *         maintain array compactness: the removed entry is replaced by the last
     *         element and the corresponding `docIndexes` entry is updated, before the
     *         array is popped. The `DocumentRemoved` event is emitted with the URI and
     *         hash of the document before deletion; the `documents` mapping entry is then
     *         cleared.
     *         Emits: `IERC1643.DocumentRemoved`.
     * @param _name  `bytes32` identifier of the document to remove; must reference an
     *               existing document.
     */
    function removeDocument(bytes32 _name) external override onlyUnpaused onlyRole(_DOCUMENTER_ROLE) {
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

    /**
     * @notice Returns the URI, content hash, and last-modified timestamp for the
     *         document identified by `_name`.
     * @dev    Returns zero-value fields for all three return values if `_name` does not
     *         correspond to a registered document. Callers should check that the returned
     *         `lastModified` is non-zero before relying on the URI and hash.
     * @param _name  `bytes32` identifier of the document to retrieve.
     * @return       URI string of the document.
     * @return       Content hash of the document.
     * @return       Unix timestamp of the most recent modification.
     */
    function getDocument(bytes32 _name) external view override returns (string memory, bytes32, uint256) {
        ERC1643Storage storage erc1643Storage = _erc1643Storage();
        return (
            erc1643Storage.documents[_name].uri,
            erc1643Storage.documents[_name].docHash,
            erc1643Storage.documents[_name].lastModified
        );
    }

    /**
     * @notice Returns the array of all currently registered document names.
     * @dev    Returns the live `docNames` array from Diamond Storage. The order reflects
     *         registration history subject to swap-and-pop reordering caused by
     *         `removeDocument` calls; callers must not assume stable ordering. Gas cost
     *         scales linearly with the number of registered documents.
     * @return Array of `bytes32` document name identifiers currently registered.
     */
    function getAllDocuments() external view override returns (bytes32[] memory) {
        return _erc1643Storage().docNames;
    }

    /**
     * @notice Returns the Diamond Storage pointer for `ERC1643Storage`.
     * @dev    Uses inline assembly to position the struct at the deterministic slot
     *         defined by `_ERC1643_STORAGE_POSITION`, following the ERC-2535 Diamond
     *         Storage Pattern. Slot isolation prevents collisions with other facet
     *         storage structs in the same proxy. Must only be called from within this
     *         contract.
     * @return erc1643Storage  Storage pointer to the `ERC1643Storage` struct.
     */
    function _erc1643Storage() private pure returns (ERC1643Storage storage erc1643Storage) {
        bytes32 position = _ERC1643_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc1643Storage.slot := position
        }
    }
}
