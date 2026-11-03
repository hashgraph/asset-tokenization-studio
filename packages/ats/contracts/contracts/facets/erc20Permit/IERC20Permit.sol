// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey Erc20permit
bytes32 constant RESOLVER_KEY_ERC20PERMIT = 0xb9b450cd33d22a14f4cc67bea5d1afefac1f0e7c5230fce1b942f751c37a9e6d;

/**
 * @title IERC20Permit
 * @notice Defines the ERC-2612 permit interface for signature-based ERC20 approvals.
 * @dev Exposes initialisation and permit operations expected from an ERC20 permit facet.
 *      Implementations must enforce replay protection, deadline checks, and signer validity.
 * @author Tokeny Solutions
 */
interface IERC20Permit {
    /**
     * @notice Emitted once when the ERC20 permit capability is initialised on a token.
     * @dev Fires exclusively from `initializeERC20Permit` after successful facet registration.
     */
    event ERC20PermitInitialized();

    /**
     * @notice Raised when a permit signature is submitted after its expiry deadline.
     * @dev The permit must not mutate allowance state when the deadline has passed.
     * @param deadline Timestamp after which the permit is no longer valid.
     */
    error ERC2612ExpiredSignature(uint256 deadline);

    /**
     * @notice Raised when the recovered permit signer does not match the token owner.
     * @dev Protects approvals from invalid, malformed, or unauthorised signatures.
     * @param signer Address recovered from the submitted permit signature.
     * @param owner Address expected to have authorised the permit.
     */
    error ERC2612InvalidSigner(address signer, address owner);

    /**
     * @notice Initialises the ERC20 permit capability on the token.
     * @dev Restricted to `DEFAULT_ADMIN_ROLE` by the implementation. Callable once and expected
     *      to revert with `FacetAlreadyRegistered` on subsequent calls. Emits
     *      `ERC20PermitInitialized` on success.
     */
    function initializeERC20Permit() external;

    /**
     * @notice Approves a spender using an owner's off-chain ERC-2612 signature.
     * @dev Validates the deadline, owner nonce, EIP-712 digest, and recovered signer before
     *      updating allowance. Reverts with `ERC2612ExpiredSignature` or
     *      `ERC2612InvalidSigner` when validation fails.
     * @param _owner Token holder granting the allowance.
     * @param _spender Address authorised to spend `owner` tokens.
     * @param _value Allowance amount approved for `spender`.
     * @param _deadline Last timestamp at which the signature is valid.
     * @param _v Recovery identifier of the ECDSA signature.
     * @param _r First 32-byte word of the ECDSA signature.
     * @param _s Second 32-byte word of the ECDSA signature.
     */
    function permit(
        address _owner,
        address _spender,
        uint256 _value,
        uint256 _deadline,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    ) external;
}
