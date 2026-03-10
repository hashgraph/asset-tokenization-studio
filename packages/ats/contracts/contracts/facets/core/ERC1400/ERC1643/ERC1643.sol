// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1643 } from "../../ERC1400/ERC1643/IERC1643.sol";
import { ERC1643StorageWrapper } from "../../../../domain/asset/ERC1643StorageWrapper.sol";
import { AccessStorageWrapper } from "../../../../domain/core/AccessStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { _DOCUMENTER_ROLE } from "../../../../constants/roles.sol";

abstract contract ERC1643 is IERC1643 {
    function setDocument(bytes32 _name, string calldata _uri, bytes32 _documentHash) external override {
        AccessStorageWrapper.checkRole(_DOCUMENTER_ROLE);
        PauseStorageWrapper.requireNotPaused();
        ERC1643StorageWrapper.setDocument(_name, _uri, _documentHash);
    }

    function removeDocument(bytes32 _name) external override {
        AccessStorageWrapper.checkRole(_DOCUMENTER_ROLE);
        PauseStorageWrapper.requireNotPaused();
        ERC1643StorageWrapper.removeDocument(_name);
    }

    function getDocument(bytes32 _name) external view override returns (string memory, bytes32, uint256) {
        return ERC1643StorageWrapper.getDocument(_name);
    }

    function getAllDocuments() external view override returns (bytes32[] memory) {
        return ERC1643StorageWrapper.getAllDocuments();
    }
}
