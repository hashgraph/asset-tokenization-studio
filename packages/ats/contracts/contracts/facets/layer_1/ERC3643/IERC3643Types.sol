// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IERC3643Types {
    event UpdatedTokenInformation(
        string indexed newName,
        string indexed newSymbol,
        uint8 newDecimals,
        string newVersion,
        address indexed newOnchainID
    );

    event IdentityRegistryAdded(address indexed identityRegistry);

    event AgentAdded(address indexed agent);

    event AgentRemoved(address indexed agent);

    event RecoverySuccess(address lostWallet, address newWallet, address investorOnchainID);

    event ComplianceAdded(address indexed compliance);

    error WalletRecovered();

    error CannotRecoverWallet();

    error InputAmountsArrayLengthMismatch();

    error InputBoolArrayLengthMismatch();

    error ComplianceCallFailed();

    error ComplianceNotAllowed();

    error IdentityRegistryCallFailed();

    error AddressNotVerified();

    error InsufficientFrozenBalance(
        address user,
        uint256 requestedUnfreeze,
        uint256 availableFrozen,
        bytes32 partition
    );
}
