// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey Erc20permit
bytes32 constant RESOLVER_KEY_ERC20PERMIT = 0xb9b450cd33d22a14f4cc67bea5d1afefac1f0e7c5230fce1b942f751c37a9e6d;

interface IERC20Permit {
    error ERC2612ExpiredSignature(uint256 deadline);
    error ERC2612InvalidSigner(address signer, address owner);

    /**
     * @notice Approves a third party to spend tokens using off-chain signature
     */
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
}
