// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1643 } from "../../interfaces/ERC1400/IERC1643.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { LibERC1643 } from "../../../../lib/domain/LibERC1643.sol";
import { LibAccess } from "../../../../lib/core/LibAccess.sol";
import { LibPause } from "../../../../lib/core/LibPause.sol";
import { _DOCUMENTER_ROLE } from "../../../../constants/roles.sol";

abstract contract ERC1643FacetBase is IERC1643, IStaticFunctionSelectors {
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

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](4);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this.getDocument.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.setDocument.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.removeDocument.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getAllDocuments.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC1643).interfaceId;
    }
}
