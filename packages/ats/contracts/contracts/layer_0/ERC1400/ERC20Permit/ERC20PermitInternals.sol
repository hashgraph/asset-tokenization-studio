// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC20VotesInternals } from "../ERC20Votes/ERC20VotesInternals.sol";

abstract contract ERC20PermitInternals is ERC20VotesInternals {
    function _permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal virtual;
    // solhint-disable-next-line func-name-mixedcase
    function _DOMAIN_SEPARATOR() internal view virtual returns (bytes32);
    function _version() internal view virtual returns (string memory);
}
