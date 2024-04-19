// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IERC1644StorageWrapper {
    // Event emitted when controller features will no longer in use
    event FinalizedControllerFeature(address operator);

    event ControllerTransfer(
        address _controller,
        address indexed _from,
        address indexed _to,
        uint256 _value,
        bytes _data,
        bytes _operatorData
    );

    event ControllerRedemption(
        address _controller,
        address indexed _tokenHolder,
        uint256 _value,
        bytes _data,
        bytes _operatorData
    );

    error TokenIsNotControllable();
}
