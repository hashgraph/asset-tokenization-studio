// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IAssociation {
    /**
     * @dev Associates the sender account to the token
     *
     * @return success_ true or false
     */
    function associate() external returns (bool success_);

    /**
     * @dev Dissociates the sender account from the token
     *
     * @return success_ true or false
     */
    function dissociate() external returns (bool success_);

    /**
     * @dev Checks if the an account is associated to the token
     *
     * @return bool true or false
     */
    function isAssociated(address _account) external view returns (bool);
}
