// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20Permit } from "./IERC20Permit.sol";
import { PauseModifiers } from "../../../../domain/core/PauseModifiers.sol";
import { ControlListModifiers } from "../../../../infrastructure/utils/ControlListModifiers.sol";
import { ERC3643StorageWrapper } from "../../../../domain/core/ERC3643StorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC20PermitStorageWrapper } from "../../../../domain/asset/ERC20PermitStorageWrapper.sol";

abstract contract ERC20Permit is IERC20Permit, PauseModifiers, ControlListModifiers {
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external override onlyUnpaused onlyListedAllowed(owner) onlyListedAllowed(spender) {
        ERC1410StorageWrapper.requireValidAddress(owner);
        ERC1410StorageWrapper.requireValidAddress(spender);
        ERC3643StorageWrapper.requireUnrecoveredAddress(owner);
        ERC3643StorageWrapper.requireUnrecoveredAddress(spender);
        ERC1410StorageWrapper.requireWithoutMultiPartition();
        ERC20PermitStorageWrapper.permit(owner, spender, value, deadline, v, r, s);
    }

    // solhint-disable-next-line func-name-mixedcase
    function DOMAIN_SEPARATOR() external view override returns (bytes32) {
        return ERC20PermitStorageWrapper.DOMAIN_SEPARATOR();
    }
}
