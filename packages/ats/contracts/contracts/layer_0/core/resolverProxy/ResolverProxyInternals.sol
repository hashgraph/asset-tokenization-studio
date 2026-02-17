// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Modifiers } from "../../Modifiers.sol";
import { IBusinessLogicResolver } from "../../../interfaces/resolver/IBusinessLogicResolver.sol";

abstract contract ResolverProxyInternals is Modifiers {
    function _getBusinessLogicResolver() internal view virtual returns (IBusinessLogicResolver);
    function _getResolverProxyConfigurationId() internal view virtual returns (bytes32);
    function _getResolverProxyVersion() internal view virtual returns (uint256);
}
