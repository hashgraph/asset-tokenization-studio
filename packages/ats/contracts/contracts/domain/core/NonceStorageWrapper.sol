// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import { _NONCE_STORAGE_POSITION } from "../../constants/storagePositions.sol";

/**
 * @notice Storage struct for nonce management
 * @param nonces Mapping of account addresses to their respective nonces
 */
struct NonceDataStorage {
    mapping(address => uint256) nonces;
}

/**
 * @title NonceStorageWrapper
 * @notice Library for managing account nonces using Diamond Storage Pattern
 * @dev Provides internal functions to read and write nonce values for accounts
 * @author Hashgraph
 */
library NonceStorageWrapper {
    /**
     * @notice Sets nonce for an account
     * @dev Updates the nonce mapping in Diamond Storage for the specified account
     * @param _nonce Nonce value to set
     * @param _account Account to set nonce for
     */
    function setNonceFor(uint256 _nonce, address _account) internal {
        nonceStorage().nonces[_account] = _nonce;
    }

    /**
     * @notice Gets nonce for an account
     * @dev Retrieves the current nonce value from Diamond Storage for the specified account
     * @param _account Account to get nonce for
     * @return Nonce value associated with the account
     */
    function getNonceFor(address _account) internal view returns (uint256) {
        return nonceStorage().nonces[_account];
    }

    /**
     * @notice Returns the NonceDataStorage storage pointer for the diamond storage position
     * @dev Uses inline assembly to load storage at a predetermined slot for Diamond pattern
     * @return nonces_ Storage pointer to NonceDataStorage
     */
    function nonceStorage() private pure returns (NonceDataStorage storage nonces_) {
        bytes32 position = _NONCE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            nonces_.slot := position
        }
    }
}
