// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ResolverProxyInternals } from "../resolverProxy/ResolverProxyInternals.sol";

abstract contract NonceInternals is ResolverProxyInternals {
    function _setNonceFor(uint256 _nounce, address _account) internal virtual;
    function _getNonceFor(address _account) internal view virtual returns (uint256);
}
