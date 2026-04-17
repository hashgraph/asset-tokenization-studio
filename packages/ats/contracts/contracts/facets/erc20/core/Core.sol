// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICore } from "./ICore.sol";
import { IERC20 } from "../../layer_1/ERC1400/ERC20/IERC20.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ERC20StorageWrapper } from "../../../domain/asset/ERC20StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../../domain/core/ERC3643StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { _TREX_OWNER_ROLE } from "../../../constants/roles.sol";
import { _ERC20_INIT_BITS_CORE } from "../../../constants/initBits/erc20InitBits.sol";

/**
 * @title Core
 * @notice Abstract implementation of the Core facet — identity metadata + init.
 * @dev Reads/writes the ERC20 identity slice via ERC20StorageWrapper helpers and
 *      forwards mutation-with-event semantics (setName/setSymbol) to
 *      ERC3643StorageWrapper (which emits UpdatedTokenInformation). The one-shot
 *      initializeCore guard is driven by the ERC20 init bitmap (_ERC20_INIT_BITS_CORE).
 * @author Asset Tokenization Studio Team
 */
abstract contract Core is ICore, Modifiers {
    /**
     * @notice Initializes Core facet with ERC20 metadata (only once).
     * @param erc20Metadata ERC20 metadata to initialize with.
     */
    function initializeCore(
        IERC20.ERC20Metadata calldata erc20Metadata
    ) external override onlyNotErc20Initialized(_ERC20_INIT_BITS_CORE) {
        ERC20StorageWrapper.writeErc20Metadata(erc20Metadata);
        ERC20StorageWrapper.markInitialized(_ERC20_INIT_BITS_CORE);
    }

    /**
     * @notice Sets token name (requires TREX_OWNER_ROLE, only when unpaused)
     * @param _name New token name
     */
    function setName(string calldata _name) external override onlyUnpaused onlyRole(_TREX_OWNER_ROLE) {
        ERC3643StorageWrapper.setName(_name);
    }

    /**
     * @notice Sets token symbol (requires TREX_OWNER_ROLE, only when unpaused)
     * @param _symbol New token symbol
     */
    function setSymbol(string calldata _symbol) external override onlyUnpaused onlyRole(_TREX_OWNER_ROLE) {
        ERC3643StorageWrapper.setSymbol(_symbol);
    }

    /**
     * @notice Returns token name.
     * @return Token name string.
     */
    function name() external view override returns (string memory) {
        return ERC20StorageWrapper.getName();
    }

    /**
     * @notice Returns token symbol.
     * @return Token symbol string.
     */
    function symbol() external view override returns (string memory) {
        return ERC20StorageWrapper.getSymbol();
    }

    /**
     * @notice Returns token decimals adjusted at current block timestamp
     * @return Token decimals value
     */
    function decimals() external view override returns (uint8) {
        return ERC20StorageWrapper.decimalsAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp());
    }

    /**
     * @notice Returns full ERC20 metadata adjusted at current block timestamp
     * @return ERC20 metadata structure
     */
    function getERC20Metadata() external view override returns (IERC20.ERC20Metadata memory) {
        return ERC20StorageWrapper.getERC20MetadataAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp());
    }

    /**
     * @notice Returns token version
     * @return Version string
     */
    function version() external view override returns (string memory) {
        return ERC3643StorageWrapper.version();
    }
}
