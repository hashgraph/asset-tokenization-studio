// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title MockedSilentModule
 * @author Asset Tokenization Studio Team
 * @notice Answers every selector with success and empty returndata.
 * @dev This is the observable behaviour shared by an externally owned account, a
 * contract with a silent fallback, a Hedera system contract, and a Hedera token's
 * HIP-719 facade. Registering any of them as `compliance` or `identityRegistry`
 * makes the corresponding ERC-3643 seam pass unconditionally, because
 * `ERC1594StorageWrapper` reads "no answer" as "allowed".
 *
 * Used as the failing case for both seams; no Hedera-specific behaviour is
 * needed to reproduce it.
 */
contract MockedSilentModule {
    // solhint-disable-next-line no-empty-blocks
    fallback() external {}
}
