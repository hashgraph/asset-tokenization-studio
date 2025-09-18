// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

// solhint-disable no-global-import
import '@tokenysolutions/t-rex/contracts/factory/TREXFactory.sol';
import {
    TRexIFactory,
    FactoryRegulationData,
    IResolverProxy
} from '../../interfaces/IFactory.sol';
import {
    _TREX_OWNER_ROLE,
    _DEFAULT_ADMIN_ROLE
} from '../../interfaces/roles.sol';

library SecurityDeploymentLib {
    function deployEquity(
        address _atsFactory,
        address _tRexOwner,
        TRexIFactory.EquityData memory _equityData,
        FactoryRegulationData memory _factoryRegulationData
    ) internal returns (IToken token_) {
        _equityData.security.rbacs = _prepareRbacs(
            _equityData.security.rbacs,
            _tRexOwner
        );
        token_ = IToken(
            TRexIFactory(_atsFactory).deployEquity(
                _equityData,
                _factoryRegulationData
            )
        );
    }

    function deployBond(
        address _atsFactory,
        address _tRexOwner,
        TRexIFactory.BondData memory _bondData,
        FactoryRegulationData memory _factoryRegulationData
    ) internal returns (IToken token_) {
        _bondData.security.rbacs = _prepareRbacs(
            _bondData.security.rbacs,
            _tRexOwner
        );

        token_ = IToken(
            TRexIFactory(_atsFactory).deployBond(
                _bondData,
                _factoryRegulationData
            )
        );
    }

    /**
     * @dev Prepares RBAC array by adding T_REX_OWNER_ROLE to address(this)
     * @dev Checks if tRexOwner was already provided in the RBACs, if not, it is added
     */
    function _prepareRbacs(
        IResolverProxy.Rbac[] memory _rbacs,
        address _tRexOwner
    ) private view returns (IResolverProxy.Rbac[] memory) {
        bool ownerMatch;
        uint256 length = _rbacs.length;

        // Check if owner was already assigned the role
        for (uint256 i = 0; i < length; ) {
            if (
                _rbacs[i].role == _TREX_OWNER_ROLE &&
                _rbacs[i].members.length > 0
            ) {
                for (uint256 j = 0; j < _rbacs[i].members.length; ) {
                    if (_tRexOwner == _rbacs[i].members[j]) {
                        ownerMatch = true;
                        break;
                    }
                    unchecked {
                        ++j;
                    }
                }
            }
            if (ownerMatch) break;
            unchecked {
                ++i;
            }
        }

        // Resize array
        IResolverProxy.Rbac[] memory newRbacs = new IResolverProxy.Rbac[](
            length + 2
        );

        for (uint256 i = 0; i < length; ) {
            newRbacs[i] = _rbacs[i];
            unchecked {
                ++i;
            }
        }

        address[] memory membersArr;
        if (!ownerMatch) {
            membersArr = new address[](2);
            membersArr[0] = address(this);
            membersArr[1] = _tRexOwner;
        } else {
            membersArr = new address[](1);
            membersArr[0] = address(this);
        }

        newRbacs[length] = IResolverProxy.Rbac({
            role: _TREX_OWNER_ROLE,
            members: membersArr
        });

        membersArr = new address[](1);
        membersArr[0] = address(this);

        newRbacs[length + 1] = IResolverProxy.Rbac({
            role: _DEFAULT_ADMIN_ROLE,
            members: membersArr
        });

        return newRbacs;
    }
}
