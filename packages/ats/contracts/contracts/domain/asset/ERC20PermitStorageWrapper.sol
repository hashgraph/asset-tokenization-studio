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

/**
 * @title ERC20PermitStorageWrapper - ERC-20 Permit Storage Wrapper
 * @notice Storage wrapper implementing EIP-2612 permit logic for gasless ERC-20
 *         approvals on a security token.
 * @dev Validates EIP-712 signatures against the token's domain separator and
 *      delegates the resulting approval to `ERC20StorageWrapper.approve`. All
 *      functions are `internal` — the library is inlined at every call-site.
 * @author Asset Tokenization Studio Team
 */
library ERC20PermitStorageWrapper {
    /**
     * @notice Validates an EIP-2612 permit signature and, if valid, sets the
     *         ERC-20 allowance of `spender` for `owner` to `value`.
     * @dev Reverts with `ERC2612ExpiredSignature` when the current block timestamp
     *      exceeds `deadline`. Reverts with `ERC2612InvalidSigner` when the recovered
     *      signer does not match `owner`. Consumes one nonce from `NonceStorageWrapper`
     *      before signature recovery to prevent replay attacks.
     * @param owner    Address whose allowance is being set (must have signed the permit).
     * @param spender  Address that will be granted the allowance.
     * @param value    Allowance amount to set.
     * @param deadline Unix timestamp after which the signature is no longer valid.
     * @param v        Recovery byte of the ECDSA signature.
     * @param r        First 32 bytes of the ECDSA signature.
     * @param s        Second 32 bytes of the ECDSA signature.
     */
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

    /**
     * @notice Returns the EIP-712 domain separator for this token contract.
     * @dev Computes the domain hash from the token name, the resolver-proxy version
     *      (converted to a string), the current chain ID, and the contract address.
     *      The result changes when the contract is upgraded to a new version or
     *      deployed on a different chain, invalidating all outstanding permit
     *      signatures from the previous domain.
     * @return The EIP-712 domain separator bytes32 hash.
     */
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
