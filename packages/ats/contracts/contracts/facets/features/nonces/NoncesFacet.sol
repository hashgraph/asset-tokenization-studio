// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Nonces } from "./Nonces.sol";
import { INonces } from "../interfaces/INonces.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { _NONCES_RESOLVER_KEY } from "../../../constants/resolverKeys/features.sol";

contract NoncesFacet is Nonces, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _NONCES_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](1);
        staticFunctionSelectors_[selectorIndex++] = this.nonces.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(INonces).interfaceId;
    }
}
