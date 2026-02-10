// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.22;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract StablecoinMock is ERC20 {
    bool private _transferFail;
    bool private _transferRevert;

    error TransferError();

    constructor(bool transferWillFail, bool transferWillRevert) ERC20("MockUSD", "MUSD") {
        _transferFail = transferWillFail;
        _transferRevert = transferWillRevert;
        _mint(msg.sender, 1_000_000 ether);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function transferWithoutErrors(address to, uint256 amount) public returns (bool) {
        address from = _msgSender();
        _transfer(from, to, amount);
        return true;
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        if (_transferFail) {
            return false;
        }
        if (_transferRevert) {
            revert TransferError();
        }
        address from = _msgSender();
        _transfer(from, to, amount);
        return true;
    }

    function decimals() public view virtual override returns (uint8) {
        return 2;
    }
}
