// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1594Internals } from "../ERC1594/ERC1594Internals.sol";

abstract contract ERC1644Internals is ERC1594Internals {
    function _controllerRedeem(
        address _tokenHolder,
        uint256 _value,
        bytes memory _data,
        bytes memory _operatorData
    ) internal virtual;
    function _controllerTransfer(
        address _from,
        address _to,
        uint256 _value,
        bytes memory _data,
        bytes memory _operatorData
    ) internal virtual;
    function _finalizeControllable() internal virtual;
    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ERC1644(bool _controllable) internal virtual;
    function _isControllable() internal view virtual returns (bool);
    function _isERC1644Initialized() internal view virtual returns (bool);
}
