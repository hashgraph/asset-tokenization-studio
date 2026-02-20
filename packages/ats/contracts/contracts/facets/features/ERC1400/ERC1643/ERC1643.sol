// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1643 } from "../../interfaces/ERC1400/IERC1643.sol";
import { LibERC1643 } from "../../../../lib/domain/LibERC1643.sol";
import { LibAccess } from "../../../../lib/core/LibAccess.sol";
import { LibPause } from "../../../../lib/core/LibPause.sol";
import { _DOCUMENTER_ROLE } from "../../../../constants/roles.sol";

abstract contract ERC1643 is IERC1643 {
    function setDocument(bytes32 _name, string calldata _uri, bytes32 _documentHash) external override {
        LibAccess.checkRole(_DOCUMENTER_ROLE);
        LibPause.requireNotPaused();
        LibERC1643.setDocument(_name, _uri, _documentHash);
    }

    function removeDocument(bytes32 _name) external override {
        LibAccess.checkRole(_DOCUMENTER_ROLE);
        LibPause.requireNotPaused();
        LibERC1643.removeDocument(_name);
    }

    function getDocument(bytes32 _name) external view override returns (string memory, bytes32, uint256) {
        return LibERC1643.getDocument(_name);
    }

    function getAllDocuments() external view override returns (bytes32[] memory) {
        return LibERC1643.getAllDocuments();
    }
}
