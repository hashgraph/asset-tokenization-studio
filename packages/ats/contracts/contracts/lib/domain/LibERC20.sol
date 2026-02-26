// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC20Storage, erc20Storage } from "../../storage/ERC20StorageAccessor.sol";
import { IERC20 } from "../../facets/features/interfaces/ERC1400/IERC20.sol";
import { IERC20 } from "../../facets/features/interfaces/ERC1400/IERC20.sol";
import { IFactory } from "../../factory/IFactory.sol";

/// @title LibERC20
/// @notice Library for ERC20 token standard storage management
/// @dev Extracts and manages ERC20-specific state (name, symbol, decimals, allowances)
/// without transfer/approval orchestration logic.
library LibERC20 {
    // ═══════════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Initialize ERC20 metadata
    /// @param erc20Metadata The metadata to initialize (name, symbol, isin, decimals, securityType)
    function initialize(IERC20.ERC20Metadata calldata erc20Metadata) internal {
        ERC20Storage storage s = erc20Storage();
        s.name = erc20Metadata.info.name;
        s.symbol = erc20Metadata.info.symbol;
        s.isin = erc20Metadata.info.isin;
        s.decimals = erc20Metadata.info.decimals;
        s.securityType = erc20Metadata.securityType;
        s.initialized = true;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // METADATA SETTERS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Set the token name
    /// @param name The new name
    function setName(string calldata name) internal {
        erc20Storage().name = name;
    }

    /// @notice Set the token symbol
    /// @param symbol The new symbol
    function setSymbol(string calldata symbol) internal {
        erc20Storage().symbol = symbol;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // DECIMALS ADJUSTMENT
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Adjust decimals by a delta (typically for scheduled balance adjustments)
    /// @param decimalsDelta The amount to add to current decimals
    function adjustDecimals(uint8 decimalsDelta) internal {
        erc20Storage().decimals += decimalsDelta;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ALLOWANCE STORAGE MANAGEMENT (Non-view functions)
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Set the allowance from owner to spender
    /// @param owner The token owner
    /// @param spender The spender address
    /// @param amount The new allowance amount
    function setAllowance(address owner, address spender, uint256 amount) internal {
        erc20Storage().allowed[owner][spender] = amount;
        emit IERC20.Approval(owner, spender, amount);
    }

    /// @notice Increase the allowance from owner to spender
    /// @param owner The token owner
    /// @param spender The spender address
    /// @param addedValue The amount to add to the allowance
    function increaseAllowance(address owner, address spender, uint256 addedValue) internal {
        ERC20Storage storage s = erc20Storage();
        uint256 newAllowance = s.allowed[owner][spender] + addedValue;
        s.allowed[owner][spender] = newAllowance;
        emit IERC20.Approval(owner, spender, newAllowance);
    }

    /// @notice Decrease the allowance from owner to spender
    /// @param owner The token owner
    /// @param spender The spender address
    /// @param subtractedValue The amount to subtract from the allowance
    /// @return The new allowance amount
    function decreaseAllowance(address owner, address spender, uint256 subtractedValue) internal returns (uint256) {
        ERC20Storage storage s = erc20Storage();
        uint256 currentAllowance = s.allowed[owner][spender];
        s.allowed[owner][spender] = currentAllowance - subtractedValue;
        return s.allowed[owner][spender];
    }

    /// @notice Reduce allowance by exact amount (for spend operations)
    /// @param owner The allowance owner
    /// @param spender The spender
    /// @param amount The exact amount to spend
    /// @return The remaining allowance after spending
    function spendAllowance(address owner, address spender, uint256 amount) internal returns (uint256) {
        ERC20Storage storage s = erc20Storage();
        uint256 currentAllowance = s.allowed[owner][spender];
        if (currentAllowance < amount) {
            revert IERC20.InsufficientAllowance(spender, owner);
        }
        s.allowed[owner][spender] = currentAllowance - amount;
        return s.allowed[owner][spender];
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ALLOWANCE QUERIES (View functions)
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Get the allowance from owner to spender
    /// @param owner The token owner
    /// @param spender The spender address
    /// @return The allowance amount
    function getAllowance(address owner, address spender) internal view returns (uint256) {
        return erc20Storage().allowed[owner][spender];
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // METADATA ACCESSORS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Get the token name
    /// @return The token name
    function getName() internal view returns (string memory) {
        return erc20Storage().name;
    }

    /// @notice Get the token symbol
    /// @return The token symbol
    function getSymbol() internal view returns (string memory) {
        return erc20Storage().symbol;
    }

    /// @notice Get the ISIN code
    /// @return The ISIN code
    function getIsin() internal view returns (string memory) {
        return erc20Storage().isin;
    }

    /// @notice Get the number of decimal places
    /// @return The number of decimals
    function getDecimals() internal view returns (uint8) {
        return erc20Storage().decimals;
    }

    /// @notice Get the security type
    /// @return The security type (Equity, Bond, etc.)
    function getSecurityType() internal view returns (IFactory.SecurityType) {
        return erc20Storage().securityType;
    }

    /// @notice Get the complete ERC20 metadata
    /// @return erc20Metadata The metadata struct containing all ERC20 info
    function getMetadata() internal view returns (IERC20.ERC20Metadata memory erc20Metadata) {
        ERC20Storage storage s = erc20Storage();
        erc20Metadata.info = IERC20.ERC20MetadataInfo({
            name: s.name,
            symbol: s.symbol,
            isin: s.isin,
            decimals: s.decimals
        });
        erc20Metadata.securityType = s.securityType;
    }

    /// @notice Check if ERC20 has been initialized
    /// @return True if initialized
    function isInitialized() internal view returns (bool) {
        return erc20Storage().initialized;
    }
}
