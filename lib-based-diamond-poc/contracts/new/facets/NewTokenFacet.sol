// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../../diamond/Interfaces.sol";
import "../libraries/LibToken.sol";
import "../libraries/LibPause.sol";

/**
 * NEW ARCHITECTURE - TokenFacet
 *
 * LOOK AT THE IMPORTS!
 * - LibToken (for ERC20 logic)
 * - LibPause (for pause checking)
 *
 * NO ACCESS CONTROL LOGIC IMPORTED!
 * (This facet doesn't manage roles, it only uses pausable transfers)
 *
 * Clear, explicit, focused.
 */
contract NewTokenFacet is ITokenFacet {

    function name() external view override returns (string memory) {
        return LibToken.name();
    }

    function symbol() external view override returns (string memory) {
        return LibToken.symbol();
    }

    function decimals() external view override returns (uint8) {
        return LibToken.decimals();
    }

    function totalSupply() external view override returns (uint256) {
        return LibToken.totalSupply();
    }

    function balanceOf(address account) external view override returns (uint256) {
        return LibToken.balanceOf(account);
    }

    function allowance(address owner, address spender) external view override returns (uint256) {
        return LibToken.allowance(owner, spender);
    }

    function transfer(address to, uint256 amount) external override returns (bool) {
        LibPause.requireNotPaused();
        LibToken.transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        LibPause.requireNotPaused();
        LibToken.approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        LibPause.requireNotPaused();
        LibToken.spendAllowance(from, msg.sender, amount);
        LibToken.transfer(from, to, amount);
        return true;
    }
}
