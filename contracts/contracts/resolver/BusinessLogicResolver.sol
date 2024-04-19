pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {
    IBusinessLogicResolver
} from '../interfaces/resolver/IBusinessLogicResolver.sol';
import {AccessControl} from '../layer_1/accessControl/AccessControl.sol';
import {Pause} from '../layer_1/pause/Pause.sol';
import {BusinessLogicResolverWrapper} from './BusinessLogicResolverWrapper.sol';
import {_DEFAULT_ADMIN_ROLE} from '../layer_1/constants/roles.sol';
import {IPause} from '../layer_1/interfaces/pause/IPause.sol';
import {
    IAccessControl
} from '../layer_1/interfaces/accessControl/IAccessControl.sol';

contract BusinessLogicResolver is
    IBusinessLogicResolver,
    AccessControl,
    Pause,
    BusinessLogicResolverWrapper
{
    // solhint-disable-next-line func-name-mixedcase
    function initialize_BusinessLogicResolver()
        external
        virtual
        override
        onlyUninitialized(_businessLogicResolverStorage().initialized)
        returns (bool success_)
    {
        _grantRole(_DEFAULT_ADMIN_ROLE, _msgSender());

        _businessLogicResolverStorage().initialized = true;
        success_ = true;
    }

    function registerBusinessLogics(
        BusinessLogicRegistryData[] calldata _businessLogics
    )
        external
        virtual
        override
        onlyValidKeys(_businessLogics)
        onlyRole(_getRoleAdmin(_DEFAULT_ADMIN_ROLE))
        onlyUnpaused
    {
        uint256 latestVersion = _registerBusinessLogics(_businessLogics);

        emit BusinessLogicsRegistered(_businessLogics, latestVersion);
    }

    function getVersionStatus(
        uint256 _version
    )
        external
        view
        virtual
        override
        validVersion(_version)
        returns (VersionStatus status_)
    {
        status_ = _getVersionStatus(_version);
    }

    function getLatestVersion()
        external
        view
        virtual
        override
        returns (uint256 latestVersion_)
    {
        latestVersion_ = _getLatestVersion();
    }

    function resolveLatestBusinessLogic(
        bytes32 _businessLogicKey
    ) external view virtual override returns (address businessLogicAddress_) {
        businessLogicAddress_ = _resolveLatestBusinessLogic(_businessLogicKey);
    }

    function resolveBusinessLogicByVersion(
        bytes32 _businessLogicKey,
        uint256 _version
    )
        external
        view
        virtual
        override
        validVersion(_version)
        returns (address businessLogicAddress_)
    {
        businessLogicAddress_ = _resolveBusinessLogicByVersion(
            _businessLogicKey,
            _version
        );
    }

    function getBusinessLogicCount()
        external
        view
        virtual
        override
        returns (uint256 businessLogicCount_)
    {
        businessLogicCount_ = _getBusinessLogicCount();
    }

    function getBusinessLogicKeys(
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        virtual
        override
        returns (bytes32[] memory businessLogicKeys_)
    {
        businessLogicKeys_ = _getBusinessLogicKeys(_pageIndex, _pageLength);
    }

    // solhint-disable no-empty-blocks
    function getStaticResolverKey()
        external
        pure
        virtual
        override(AccessControl, Pause)
        returns (bytes32 staticResolverKey_)
    {}

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override(AccessControl, Pause)
        returns (bytes4[] memory staticFunctionSelectors_)
    {}

    // solhint-enable no-empty-blocks

    function getStaticInterfaceIds()
        external
        pure
        virtual
        override(AccessControl, Pause)
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](3);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IPause).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IAccessControl)
            .interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IBusinessLogicResolver)
            .interfaceId;
    }
}
