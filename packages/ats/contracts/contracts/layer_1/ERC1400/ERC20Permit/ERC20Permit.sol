// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended
pragma solidity >=0.8.0 <0.9.0;

import { Internals } from "../../../layer_0/Internals.sol";
import { IERC20Permit } from "../../interfaces/ERC1400/IERC20Permit.sol";
import { _CONTRACT_NAME_ERC20PERMIT, _CONTRACT_VERSION_ERC20PERMIT } from "../../constants/values.sol";

abstract contract ERC20Permit is IERC20Permit, Internals {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC20Permit() external override onlyUninitialized(_isERC20PermitInitialized()) {
        _initialize_ERC20Permit();
    }

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    )
        external
        override
        onlyUnpaused
        validateAddress(owner)
        validateAddress(spender)
        onlyListedAllowed(owner)
        onlyListedAllowed(spender)
        onlyUnrecoveredAddress(owner)
        onlyUnrecoveredAddress(spender)
        onlyWithoutMultiPartition
    {
        _permit(owner, spender, value, deadline, v, r, s);
    }

    function nonces(address owner) external view override returns (uint256) {
        return _getNounceFor(owner);
    }

    // solhint-disable-next-line func-name-mixedcase
    function DOMAIN_SEPARATOR() external view override returns (bytes32) {
        return _DOMAIN_SEPARATOR();
    }
}
