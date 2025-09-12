// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/* solhint-disable-next-line no-empty-blocks */
interface IIdentityRegistry {
    /*
     * @dev Checks if a user address is verified in the identity registry.
     * @param _userAddress The address of the user to check.
     * @return bool Returns true if the user is verified, false otherwise.
     */
    function isVerified(address _userAddress) external view returns (bool);
}
