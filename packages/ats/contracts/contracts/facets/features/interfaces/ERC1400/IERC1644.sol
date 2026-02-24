// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1644Base } from "./IERC1644Base.sol";

interface IERC1644 is IERC1644Base {
    event TransferByPartition(
        bytes32 indexed partition,
        address indexed from,
        address indexed to,
        uint256 value,
        bytes data
    );

    function initialize_ERC1644(bool _isControllable) external;
    function controllerTransfer(address _from, address _to, uint256 _value, bytes calldata _data, bytes calldata _operatorData) external;
    function controllerRedeem(address _tokenHolder, uint256 _value, bytes calldata _data, bytes calldata _operatorData) external;
    function finalizeControllable() external;
    function isControllable() external view returns (bool);
}
