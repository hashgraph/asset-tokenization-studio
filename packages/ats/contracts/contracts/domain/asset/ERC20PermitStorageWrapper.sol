// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20Permit } from "../../facets/layer_1/ERC1400/ERC20Permit/IERC20Permit.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { TYPEHASH_ERC20_PERMIT } from "../../constants/eip712.sol";
import { _getDomainHash } from "../../infrastructure/utils/EIP712.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { NonceStorageWrapper } from "../core/NonceStorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { ResolverProxyStorageWrapper } from "../core/ResolverProxyStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

library ERC20PermitStorageWrapper {
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal {
        if (TimeTravelStorageWrapper.getBlockTimestamp() > deadline) {
            revert IERC20Permit.ERC2612ExpiredSignature(deadline);
        }

        uint256 currentNonce = NonceStorageWrapper.getNonceFor(owner);

        NonceStorageWrapper.setNonceFor(owner);
        // solhint-disable-next-line func-name-mixedcase
        address signer = ECDSA.recover(
            ECDSA.toTypedDataHash(
                DOMAIN_SEPARATOR(),
                keccak256(abi.encode(TYPEHASH_ERC20_PERMIT, owner, spender, value, currentNonce, deadline))
            ),
            v,
            r,
            s
        );

        if (signer != owner) revert IERC20Permit.ERC2612InvalidSigner(signer, owner);
        ERC20StorageWrapper.approve(owner, spender, value);
    }

    // solhint-disable-next-line func-name-mixedcase
    function DOMAIN_SEPARATOR() internal view returns (bytes32) {
        return
            _getDomainHash(
                ERC20StorageWrapper.getName(),
                Strings.toString(ResolverProxyStorageWrapper.getResolverProxyVersion()),
                EvmAccessors.getChainId(),
                address(this)
            );
    }
}
