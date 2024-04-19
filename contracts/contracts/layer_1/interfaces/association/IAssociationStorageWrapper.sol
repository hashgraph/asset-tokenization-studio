// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IAssociationStorageWrapper {
    /**
     * @dev Emitted when the an account is associated to the token
     *
     * @param operator The caller of the function that emitted the event
     * @param account The associated account
     */
    event AccountAssociated(address indexed operator, address indexed account);

    /**
     * @dev Emitted when the an account is dissociated from the token
     *
     * @param operator The caller of the function that emitted the event
     * @param account The dissociated account
     */
    event AccountDissociated(address indexed operator, address indexed account);

    /**
     * @dev Emitted when the an account is not associated to an account and trying to dissociate it
     *
     */
    error AccountIsNotAssociated(address account);

    /**
     * @dev Emitted when the account is already associated and we are trying to associate it again
     *
     */
    error AccountAlreadyAssociated(address account);

    /**
     * @dev Emitted when the account cannot be dissociated because its balance is not 0
     *
     */
    error CannotDissociate(address account);
}
