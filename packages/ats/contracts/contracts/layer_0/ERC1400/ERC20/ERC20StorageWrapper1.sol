// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC20_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IERC20 } from "../../../layer_1/interfaces/ERC1400/IERC20.sol";
import { ERC1410BasicStorageWrapperRead } from "../ERC1410/ERC1410BasicStorageWrapperRead.sol";
import { IFactory } from "../../../interfaces/factory/IFactory.sol";

abstract contract ERC20StorageWrapper1 is ERC1410BasicStorageWrapperRead {
    struct ERC20Storage {
        string name;
        string symbol;
        string isin;
        uint8 decimals;
        bool initialized;
        mapping(address => mapping(address => uint256)) allowed;
        IFactory.SecurityType securityType;
    }

    // solhint-disable-next-line func-name-mixedcase
    function _initialize_ERC20(IERC20.ERC20Metadata calldata erc20Metadata) internal override {
        ERC20Storage storage erc20Storage = _erc20Storage();
        erc20Storage.name = erc20Metadata.info.name;
        erc20Storage.symbol = erc20Metadata.info.symbol;
        erc20Storage.isin = erc20Metadata.info.isin;
        erc20Storage.decimals = erc20Metadata.info.decimals;
        erc20Storage.securityType = erc20Metadata.securityType;
        erc20Storage.initialized = true;
    }

    function _adjustDecimals(uint8 decimals) internal override {
        _erc20Storage().decimals += decimals;
    }

    function _decimalsAdjusted() internal view override returns (uint8) {
        return _decimalsAdjustedAt(_blockTimestamp());
    }

    function _allowanceAdjusted(address _owner, address _spender) internal view override returns (uint256) {
        return _allowanceAdjustedAt(_owner, _spender, _blockTimestamp());
    }

    function _allowance(address _owner, address _spender) internal view override returns (uint256) {
        return _erc20Storage().allowed[_owner][_spender];
    }

    function _decimalsAdjustedAt(uint256 _timestamp) internal view override returns (uint8) {
        return _getERC20MetadataAdjustedAt(_timestamp).info.decimals;
    }

    function _allowanceAdjustedAt(
        address _owner,
        address _spender,
        uint256 _timestamp
    ) internal view override returns (uint256) {
        uint256 factor = _calculateFactor(_getAbafAdjustedAt(_timestamp), _getAllowanceLabaf(_owner, _spender));
        return _allowance(_owner, _spender) * factor;
    }

    function _getERC20MetadataAdjusted() internal view override returns (IERC20.ERC20Metadata memory erc20Metadata_) {
        erc20Metadata_ = _getERC20MetadataAdjustedAt(_blockTimestamp());
    }

    function _getERC20MetadataAdjustedAt(
        uint256 _timestamp
    ) internal view override returns (IERC20.ERC20Metadata memory erc20Metadata_) {
        (, uint8 pendingDecimals) = _getPendingScheduledBalanceAdjustmentsAt(_timestamp);
        erc20Metadata_ = _getERC20Metadata();
        erc20Metadata_.info.decimals += pendingDecimals;
    }

    function _getERC20Metadata() internal view override returns (IERC20.ERC20Metadata memory erc20Metadata_) {
        ERC20Storage storage erc20Storage = _erc20Storage();
        IERC20.ERC20MetadataInfo memory erc20Info = IERC20.ERC20MetadataInfo({
            name: erc20Storage.name,
            symbol: erc20Storage.symbol,
            isin: erc20Storage.isin,
            decimals: erc20Storage.decimals
        });
        erc20Metadata_ = IERC20.ERC20Metadata({ info: erc20Info, securityType: erc20Storage.securityType });
    }

    function _getName() internal view override returns (string memory) {
        return _erc20Storage().name;
    }

    function _decimals() internal view override returns (uint8) {
        return _erc20Storage().decimals;
    }

    function _isERC20Initialized() internal view override returns (bool) {
        return _erc20Storage().initialized;
    }

    function _erc20Storage() internal pure returns (ERC20Storage storage erc20Storage_) {
        bytes32 position = _ERC20_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc20Storage_.slot := position
        }
    }
}
