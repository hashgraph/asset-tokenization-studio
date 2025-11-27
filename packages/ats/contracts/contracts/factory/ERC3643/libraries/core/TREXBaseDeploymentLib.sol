// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

// solhint-disable no-global-import
import "@tokenysolutions/t-rex/contracts/factory/TREXFactory.sol";
import { TRexIAccessControl } from "../../interfaces/IAccessControl.sol";
import "@onchain-id/solidity/contracts/factory/IIdFactory.sol";
import { TREXFactoryAts } from "../../TREXFactory.sol";
import { _TREX_OWNER_ROLE, _DEFAULT_ADMIN_ROLE } from "../../interfaces/roles.sol";

// solhint-disable custom-errors
library TREXBaseDeploymentLib {
    /// @dev Copied from ITREXFactory
    event TREXSuiteDeployed(
        address indexed _token,
        address _ir,
        address _irs,
        address _tir,
        address _ctr,
        address _mc,
        string indexed _salt
    );
    /// @dev Copied from ITREXFactory
    event Deployed(address indexed _addr);

    function deployTREXSuite(
        mapping(string => address) storage _tokenDeployed,
        address _implementationAuthority,
        address _idFactory,
        string memory _salt,
        TREXFactoryAts.TokenDetailsAts memory _tokenDetails,
        ITREXFactory.ClaimDetails memory _claimDetails,
        IToken _token,
        address _identityRegistry,
        address _compliance
    ) internal {
        require(_tokenDeployed[_salt] == address(0), "token already deployed");
        require((_claimDetails.issuers).length == (_claimDetails.issuerClaims).length, "claim pattern not valid");
        require((_claimDetails.issuers).length <= 5, "max 5 claim issuers at deployment");
        require((_claimDetails.claimTopics).length <= 5, "max 5 claim topics at deployment");
        require(
            (_tokenDetails.irAgents).length <= 5 && (_tokenDetails.tokenAgents).length <= 5,
            "max 5 agents at deployment"
        );
        require((_tokenDetails.complianceModules).length <= 30, "max 30 module actions at deployment");
        require(
            (_tokenDetails.complianceModules).length >= (_tokenDetails.complianceSettings).length,
            "invalid compliance pattern"
        );

        IModularCompliance mc;
        uint256 transferOwnership; // Bit 0 tracks MC and bit 1 IR
        if (_compliance == address(0)) {
            mc = IModularCompliance(_deployMC(_salt, _implementationAuthority));
            _token.setCompliance(address(mc));
            mc.bindToken(address(_token));
            transferOwnership = 1;
        } else {
            mc = IModularCompliance(_compliance);
        }
        IIdentityRegistryStorage irs;
        ITrustedIssuersRegistry tir;
        IClaimTopicsRegistry ctr;
        if (_identityRegistry == address(0)) {
            tir = ITrustedIssuersRegistry(_deployTIR(_salt, _implementationAuthority));
            ctr = IClaimTopicsRegistry(_deployCTR(_salt, _implementationAuthority));
            if (_tokenDetails.irs == address(0)) {
                irs = IIdentityRegistryStorage(_deployIRS(_salt, _implementationAuthority));
            } else {
                irs = IIdentityRegistryStorage(_tokenDetails.irs);
            }

            _identityRegistry = _deployIR(_salt, _implementationAuthority, address(tir), address(ctr), address(irs));
            irs.bindIdentityRegistry(_identityRegistry);
            _token.setIdentityRegistry(_identityRegistry);
            transferOwnership |= 1 << 1;
        } else {
            tir = ITrustedIssuersRegistry(IIdentityRegistry(_identityRegistry).issuersRegistry());
            ctr = IClaimTopicsRegistry(IIdentityRegistry(_identityRegistry).topicsRegistry());
            irs = IIdentityRegistryStorage(IIdentityRegistry(_identityRegistry).identityStorage());
        }
        address _tokenID = _tokenDetails.ONCHAINID;
        if (_tokenID == address(0)) {
            _tokenID = IIdFactory(_idFactory).createTokenIdentity(address(_token), _tokenDetails.owner, _salt);
        }
        _token.setOnchainID(_tokenID);
        for (uint256 i = 0; i < (_claimDetails.claimTopics).length; i++) {
            ctr.addClaimTopic(_claimDetails.claimTopics[i]);
        }
        for (uint256 i = 0; i < (_claimDetails.issuers).length; i++) {
            tir.addTrustedIssuer(IClaimIssuer((_claimDetails).issuers[i]), _claimDetails.issuerClaims[i]);
        }
        AgentRole(_identityRegistry).addAgent(address(_token));
        for (uint256 i = 0; i < (_tokenDetails.irAgents).length; i++) {
            AgentRole(_identityRegistry).addAgent(_tokenDetails.irAgents[i]);
        }
        for (uint256 i = 0; i < (_tokenDetails.tokenAgents).length; i++) {
            AgentRole(address(_token)).addAgent(_tokenDetails.tokenAgents[i]);
        }
        for (uint256 i = 0; i < (_tokenDetails.complianceModules).length; i++) {
            if (!mc.isModuleBound(_tokenDetails.complianceModules[i])) {
                mc.addModule(_tokenDetails.complianceModules[i]);
            }
            if (i < (_tokenDetails.complianceSettings).length) {
                mc.callModuleFunction(_tokenDetails.complianceSettings[i], _tokenDetails.complianceModules[i]);
            }
        }
        _tokenDeployed[_salt] = address(_token);
        // Equivalent to transfer ownership of the token to the new owner
        TRexIAccessControl(address(_token)).renounceRole(_TREX_OWNER_ROLE);
        TRexIAccessControl(address(_token)).renounceRole(_DEFAULT_ADMIN_ROLE);
        (Ownable(_identityRegistry)).transferOwnership(_tokenDetails.owner);
        (Ownable(address(tir))).transferOwnership(_tokenDetails.owner);
        (Ownable(address(ctr))).transferOwnership(_tokenDetails.owner);
        (Ownable(address(mc))).transferOwnership(_tokenDetails.owner);
        (Ownable(address(irs))).transferOwnership(_tokenDetails.owner);

        emit TREXSuiteDeployed(
            address(_token),
            _identityRegistry,
            address(irs),
            address(tir),
            address(ctr),
            address(mc),
            _salt
        );
    }

    /**
     *
     * @notice Deploy function with create2 opcode call
     * @notice Returns the address of the contract created
     */
    function _deploy(string memory salt, bytes memory bytecode) private returns (address) {
        bytes32 saltBytes = bytes32(keccak256(abi.encodePacked(salt)));
        address addr;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            let encoded_data := add(0x20, bytecode) // load initialization code.
            let encoded_size := mload(bytecode) // load init code's length.
            addr := create2(0, encoded_data, encoded_size, saltBytes)
            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }
        emit Deployed(addr);
        return addr;
    }

    /**
     * @dev Function used to deploy a trusted issuers registry using CREATE2
     */
    function _deployTIR(string memory _salt, address implementationAuthority_) private returns (address) {
        bytes memory _code = type(TrustedIssuersRegistryProxy).creationCode;
        bytes memory _constructData = abi.encode(implementationAuthority_);
        bytes memory bytecode = abi.encodePacked(_code, _constructData);
        return _deploy(_salt, bytecode);
    }

    /**
     * @dev Function used to deploy a claim topics registry using CREATE2
     */
    function _deployCTR(string memory _salt, address implementationAuthority_) private returns (address) {
        bytes memory _code = type(ClaimTopicsRegistryProxy).creationCode;
        bytes memory _constructData = abi.encode(implementationAuthority_);
        bytes memory bytecode = abi.encodePacked(_code, _constructData);
        return _deploy(_salt, bytecode);
    }

    /**
     * @dev Function used to deploy modular compliance contract using CREATE2
     */
    function _deployMC(string memory _salt, address implementationAuthority_) private returns (address) {
        bytes memory _code = type(ModularComplianceProxy).creationCode;
        bytes memory _constructData = abi.encode(implementationAuthority_);
        bytes memory bytecode = abi.encodePacked(_code, _constructData);
        return _deploy(_salt, bytecode);
    }

    /**
     * @dev Function used to deploy an identity registry storage using CREATE2
     */
    function _deployIRS(string memory _salt, address implementationAuthority_) private returns (address) {
        bytes memory _code = type(IdentityRegistryStorageProxy).creationCode;
        bytes memory _constructData = abi.encode(implementationAuthority_);
        bytes memory bytecode = abi.encodePacked(_code, _constructData);
        return _deploy(_salt, bytecode);
    }

    /**
     * @dev Function used to deploy an identity registry using CREATE2
     */
    function _deployIR(
        string memory _salt,
        address implementationAuthority_,
        address _trustedIssuersRegistry,
        address _claimTopicsRegistry,
        address _identityStorage
    ) private returns (address) {
        bytes memory _code = type(IdentityRegistryProxy).creationCode;
        bytes memory _constructData = abi.encode(
            implementationAuthority_,
            _trustedIssuersRegistry,
            _claimTopicsRegistry,
            _identityStorage
        );
        bytes memory bytecode = abi.encodePacked(_code, _constructData);
        return _deploy(_salt, bytecode);
    }
}
