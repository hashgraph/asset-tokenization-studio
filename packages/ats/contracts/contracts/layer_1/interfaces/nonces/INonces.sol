// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

interface INonces {
    /**
     * @notice Returns the current nonce for `owner`
     */
    function nonces(address owner) external view returns (uint256);
}
