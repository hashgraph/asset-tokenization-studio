// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1644 } from "../../interfaces/ERC1400/IERC1644.sol";
import { _DEFAULT_ADMIN_ROLE, _CONTROLLER_ROLE, _AGENT_ROLE } from "../../constants/roles.sol";
import { Common } from "../../../layer_0/common/Common.sol";

abstract contract ERC1644 is IERC1644, Common {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1644(bool _controllable) external override onlyUninitialized(_erc1644Storage().initialized) {
        _erc1644Storage().isControllable = _controllable;
        _erc1644Storage().initialized = true;
    }

    function controllerTransfer(
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external override onlyUnpaused onlyWithoutMultiPartition onlyControllable {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            _checkAnyRole(roles, _msgSender());
        }
        _controllerTransfer(_from, _to, _value, _data, _operatorData);
    }

    function controllerRedeem(
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data,
        bytes calldata _operatorData
    ) external override onlyUnpaused onlyWithoutMultiPartition onlyControllable {
        {
            bytes32[] memory roles = new bytes32[](2);
            roles[0] = _CONTROLLER_ROLE;
            roles[1] = _AGENT_ROLE;
            _checkAnyRole(roles, _msgSender());
        }
        _controllerRedeem(_tokenHolder, _value, _data, _operatorData);
    }

    function finalizeControllable() external override onlyRole(_DEFAULT_ADMIN_ROLE) onlyControllable {
        _finalizeControllable();
    }

    function isControllable() external view override returns (bool) {
        return _isControllable();
    }
}
