// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IERC1644 {
    // Controller Events

    /**
     * @dev Initial configuration
     *
     * @param _isControllable true is controllable, false is not controllable
     * @return success_
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1644(
        bool _isControllable
    ) external returns (bool success_);

    function controllerTransfer(
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external;

    function controllerRedeem(
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external;

    function finalizeControllable() external;

    // Controller Operation
    function isControllable() external view returns (bool);
}
