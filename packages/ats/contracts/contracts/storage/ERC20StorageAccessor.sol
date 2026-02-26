// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC20_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _ERC20PERMIT_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _ERC20VOTES_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { IFactory } from "../factory/IFactory.sol";
import { LibCheckpoints } from "../infrastructure/lib/LibCheckpoints.sol";

/// @dev ERC20 metadata storage
struct ERC20Storage {
    string name;
    string symbol;
    string isin;
    uint8 decimals;
    bool initialized;
    mapping(address => mapping(address => uint256)) allowed;
    IFactory.SecurityType securityType;
}

/// @dev ERC20 Permit storage (deprecated fields only)
struct ERC20PermitStorage {
    // solhint-disable-next-line var-name-mixedcase
    string DEPRECATED_contractName;
    // solhint-disable-next-line var-name-mixedcase
    string DEPRECATED_contractVersion;
    // solhint-disable-next-line var-name-mixedcase
    bool DEPRECATED_initialized;
}

/// @dev ERC20 Votes storage (delegation and checkpoint voting power)
struct ERC20VotesStorage {
    bool activated;
    // solhint-disable-next-line var-name-mixedcase
    string DEPRECATED_contractName;
    // solhint-disable-next-line var-name-mixedcase
    string DEPRECATED_contractVersion;
    mapping(address => address) delegates;
    mapping(address => LibCheckpoints.Checkpoint[]) checkpoints;
    LibCheckpoints.Checkpoint[] totalSupplyCheckpoints;
    LibCheckpoints.Checkpoint[] abafCheckpoints;
    bool initialized;
}

/// @dev Access ERC20 metadata storage
function erc20Storage() pure returns (ERC20Storage storage erc20_) {
    bytes32 pos = _ERC20_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        erc20_.slot := pos
    }
}

/// @dev Access ERC20 Permit storage
function erc20PermitStorage() pure returns (ERC20PermitStorage storage erc20Permit_) {
    bytes32 pos = _ERC20PERMIT_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        erc20Permit_.slot := pos
    }
}

/// @dev Access ERC20 Votes storage
function erc20VotesStorage() pure returns (ERC20VotesStorage storage erc20Votes_) {
    bytes32 pos = _ERC20VOTES_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        erc20Votes_.slot := pos
    }
}
