// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

// solhint-disable no-global-import
import "@tokenysolutions/t-rex/contracts/factory/TREXFactory.sol";
import { TRexIAccessControl } from "../../interfaces/IRexIAccessControl.sol";
import "@onchain-id/solidity/contracts/factory/IIdFactory.sol";
import { TREXFactoryAts } from "../../TREXFactory.sol";
import { TREX_OWNER_ROLE, DEFAULT_ADMIN_ROLE } from "../../interfaces/roles.sol";

// solhint-disable custom-errors
/**
 * @title TREXBaseDeploymentLib
 * @author Asset Tokenization Studio Team
 * @notice Internal library that assembles a full T-REX (ERC-3643) suite — token, identity
 *         registry, registry storage, trusted issuers registry, claim topics registry and
 *         modular compliance — wiring the components together and forwarding ownership of any
 *         newly deployed infrastructure to the caller-specified owner.
 * @dev All proxies are deployed via CREATE2 so addresses are deterministic per `_salt`. The
 *      caller may supply pre-existing `_identityRegistry`, `_compliance` or `irs` addresses to
 *      reuse shared infrastructure across tokens; in that case those contracts are left
 *      untouched (ownership is **not** transferred) to prevent a new token deployment from
 *      hijacking admin control of suites already in production.
 */
library TREXBaseDeploymentLib {
    /**
     * @notice Emitted once the full T-REX suite has been deployed and wired for `_salt`.
     * @dev Mirrors the ITREXFactory event so off-chain indexers can treat both factories
     *      uniformly.
     * @param _token Address of the deployed token (ERC-3643).
     * @param _ir Address of the identity registry bound to the token.
     * @param _irs Address of the identity registry storage backing the identity registry.
     * @param _tir Address of the trusted issuers registry.
     * @param _ctr Address of the claim topics registry.
     * @param _mc Address of the modular compliance contract bound to the token.
     * @param _salt Deployment salt used to derive every CREATE2 address.
     */
    event TREXSuiteDeployed(
        address indexed _token,
        address _ir,
        address _irs,
        address _tir,
        address _ctr,
        address _mc,
        string indexed _salt
    );

    /**
     * @notice Emitted by `_deploy` for every CREATE2 contract deployment performed by the
     *         library, including individual proxies that make up a suite.
     * @dev Mirrors the ITREXFactory event for indexer compatibility.
     * @param _addr Address of the contract just created via CREATE2.
     */
    event Deployed(address indexed _addr);

    /**
     * @notice Deploys and wires a complete T-REX suite for `_token` under `_salt`, reusing any
     *         pre-existing infrastructure addresses supplied by the caller.
     * @dev Newly deployed contracts have their ownership transferred to `_tokenDetails.owner`;
     *      pre-existing ones keep their current owner to prevent admin hijack of shared
     *      infrastructure. Emits {TREXSuiteDeployed}. Reverts if `_salt` is already used or any
     *      array exceeds its cap (5 issuers / topics / agents, 30 compliance modules).
     * @param _tokenDeployed Storage mapping flagged with `_salt -> _token` on success.
     * @param _implementationAuthority Implementation authority shared by every proxy deployed.
     * @param _idFactory IIdFactory used to create the on-chain ID when none is provided.
     * @param _salt Deterministic deployment salt; must be unique across previous calls.
     * @param _tokenDetails Owner, on-chain ID, irs override, agents and compliance bundle.
     * @param _claimDetails Trusted issuers, claim topics and per-issuer topic lists.
     * @param _token Pre-deployed token whose suite is being assembled.
     * @param _identityRegistry Existing IR to reuse, or `address(0)` to deploy a fresh bundle.
     * @param _compliance Existing modular compliance to reuse, or `address(0)` to deploy one.
     */
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

        /**
         * @dev Track which infrastructure contracts were newly deployed in this call. Only
         *      those have their ownership transferred to `_tokenDetails.owner` below;
         *      pre-existing contracts keep their current owner to avoid hijacking admin
         *      control of shared infrastructure already used by previously deployed tokens.
         */
        bool deployedNewCompliance;
        bool deployedNewIdentityRegistry;
        bool deployedNewIdentityRegistryStorage;

        IModularCompliance modularCompliance;
        if (_compliance == address(0)) {
            modularCompliance = IModularCompliance(_deployMC(_salt, _implementationAuthority));
            _token.setCompliance(address(modularCompliance));
            modularCompliance.bindToken(address(_token));
            deployedNewCompliance = true;
        } else {
            modularCompliance = IModularCompliance(_compliance);
        }
        IIdentityRegistryStorage identityRegistryStorage;
        ITrustedIssuersRegistry trustedIssuersRegistry;
        IClaimTopicsRegistry claimTopicsRegistry;
        if (_identityRegistry == address(0)) {
            trustedIssuersRegistry = ITrustedIssuersRegistry(_deployTIR(_salt, _implementationAuthority));
            claimTopicsRegistry = IClaimTopicsRegistry(_deployCTR(_salt, _implementationAuthority));
            if (_tokenDetails.irs == address(0)) {
                identityRegistryStorage = IIdentityRegistryStorage(_deployIRS(_salt, _implementationAuthority));
                deployedNewIdentityRegistryStorage = true;
            } else {
                identityRegistryStorage = IIdentityRegistryStorage(_tokenDetails.irs);
            }

            _identityRegistry = _deployIR(
                _salt,
                _implementationAuthority,
                address(trustedIssuersRegistry),
                address(claimTopicsRegistry),
                address(identityRegistryStorage)
            );
            identityRegistryStorage.bindIdentityRegistry(_identityRegistry);
            _token.setIdentityRegistry(_identityRegistry);
            deployedNewIdentityRegistry = true;
        } else {
            trustedIssuersRegistry = ITrustedIssuersRegistry(IIdentityRegistry(_identityRegistry).issuersRegistry());
            claimTopicsRegistry = IClaimTopicsRegistry(IIdentityRegistry(_identityRegistry).topicsRegistry());
            identityRegistryStorage = IIdentityRegistryStorage(IIdentityRegistry(_identityRegistry).identityStorage());
        }
        address _tokenID = _tokenDetails.ONCHAINID;
        if (_tokenID == address(0)) {
            _tokenID = IIdFactory(_idFactory).createTokenIdentity(address(_token), _tokenDetails.owner, _salt);
        }
        _token.setOnchainID(_tokenID);
        for (uint256 topicIndex = 0; topicIndex < (_claimDetails.claimTopics).length; topicIndex++) {
            claimTopicsRegistry.addClaimTopic(_claimDetails.claimTopics[topicIndex]);
        }
        for (uint256 issuerIndex = 0; issuerIndex < (_claimDetails.issuers).length; issuerIndex++) {
            trustedIssuersRegistry.addTrustedIssuer(
                IClaimIssuer((_claimDetails).issuers[issuerIndex]),
                _claimDetails.issuerClaims[issuerIndex]
            );
        }
        AgentRole(_identityRegistry).addAgent(address(_token));
        for (
            uint256 identityRegistryAgentIndex = 0;
            identityRegistryAgentIndex < (_tokenDetails.irAgents).length;
            identityRegistryAgentIndex++
        ) {
            AgentRole(_identityRegistry).addAgent(_tokenDetails.irAgents[identityRegistryAgentIndex]);
        }
        for (
            uint256 tokenAgentIndex = 0;
            tokenAgentIndex < (_tokenDetails.tokenAgents).length;
            tokenAgentIndex++
        ) {
            AgentRole(address(_token)).addAgent(_tokenDetails.tokenAgents[tokenAgentIndex]);
        }
        for (uint256 moduleIndex = 0; moduleIndex < (_tokenDetails.complianceModules).length; moduleIndex++) {
            if (!modularCompliance.isModuleBound(_tokenDetails.complianceModules[moduleIndex])) {
                modularCompliance.addModule(_tokenDetails.complianceModules[moduleIndex]);
            }
            if (moduleIndex < (_tokenDetails.complianceSettings).length) {
                modularCompliance.callModuleFunction(
                    _tokenDetails.complianceSettings[moduleIndex],
                    _tokenDetails.complianceModules[moduleIndex]
                );
            }
        }
        _tokenDeployed[_salt] = address(_token);
        // Equivalent to transfer ownership of the token to the new owner
        TRexIAccessControl(address(_token)).renounceRole(TREX_OWNER_ROLE);
        TRexIAccessControl(address(_token)).renounceRole(DEFAULT_ADMIN_ROLE);
        if (deployedNewIdentityRegistry) {
            (Ownable(_identityRegistry)).transferOwnership(_tokenDetails.owner);
            (Ownable(address(trustedIssuersRegistry))).transferOwnership(_tokenDetails.owner);
            (Ownable(address(claimTopicsRegistry))).transferOwnership(_tokenDetails.owner);
        }
        if (deployedNewCompliance) {
            (Ownable(address(modularCompliance))).transferOwnership(_tokenDetails.owner);
        }
        if (deployedNewIdentityRegistryStorage) {
            (Ownable(address(identityRegistryStorage))).transferOwnership(_tokenDetails.owner);
        }

        emit TREXSuiteDeployed(
            address(_token),
            _identityRegistry,
            address(identityRegistryStorage),
            address(trustedIssuersRegistry),
            address(claimTopicsRegistry),
            address(modularCompliance),
            _salt
        );
    }

    /**
     * @notice Deploys `bytecode` via CREATE2 using `keccak256(salt)` as the CREATE2 salt and
     *         reverts if the resulting account has no code.
     * @dev Uses inline assembly to drive the CREATE2 opcode directly; emits {Deployed} so each
     *      individual proxy deployment is observable off-chain.
     * @param salt Caller-supplied salt; hashed once with keccak256 before being passed to
     *        CREATE2 so address derivation matches the rest of the suite.
     * @param bytecode Concatenated proxy creation code and ABI-encoded constructor arguments.
     * @return Address of the freshly deployed contract; guaranteed to hold code on return.
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
     * @notice Deploys a {TrustedIssuersRegistryProxy} via CREATE2 under `_salt`.
     * @param _salt Deployment salt shared with the rest of the suite.
     * @param implementationAuthority_ Implementation authority encoded into the proxy
     *        constructor so the proxy can resolve its logic contract.
     * @return Address of the deployed trusted issuers registry proxy.
     */
    function _deployTIR(string memory _salt, address implementationAuthority_) private returns (address) {
        bytes memory _code = type(TrustedIssuersRegistryProxy).creationCode;
        bytes memory _constructData = abi.encode(implementationAuthority_);
        bytes memory bytecode = abi.encodePacked(_code, _constructData);
        return _deploy(_salt, bytecode);
    }

    /**
     * @notice Deploys a {ClaimTopicsRegistryProxy} via CREATE2 under `_salt`.
     * @param _salt Deployment salt shared with the rest of the suite.
     * @param implementationAuthority_ Implementation authority encoded into the proxy
     *        constructor so the proxy can resolve its logic contract.
     * @return Address of the deployed claim topics registry proxy.
     */
    function _deployCTR(string memory _salt, address implementationAuthority_) private returns (address) {
        bytes memory _code = type(ClaimTopicsRegistryProxy).creationCode;
        bytes memory _constructData = abi.encode(implementationAuthority_);
        bytes memory bytecode = abi.encodePacked(_code, _constructData);
        return _deploy(_salt, bytecode);
    }

    /**
     * @notice Deploys a {ModularComplianceProxy} via CREATE2 under `_salt`.
     * @param _salt Deployment salt shared with the rest of the suite.
     * @param implementationAuthority_ Implementation authority encoded into the proxy
     *        constructor so the proxy can resolve its logic contract.
     * @return Address of the deployed modular compliance proxy.
     */
    function _deployMC(string memory _salt, address implementationAuthority_) private returns (address) {
        bytes memory _code = type(ModularComplianceProxy).creationCode;
        bytes memory _constructData = abi.encode(implementationAuthority_);
        bytes memory bytecode = abi.encodePacked(_code, _constructData);
        return _deploy(_salt, bytecode);
    }

    /**
     * @notice Deploys an {IdentityRegistryStorageProxy} via CREATE2 under `_salt`.
     * @param _salt Deployment salt shared with the rest of the suite.
     * @param implementationAuthority_ Implementation authority encoded into the proxy
     *        constructor so the proxy can resolve its logic contract.
     * @return Address of the deployed identity registry storage proxy.
     */
    function _deployIRS(string memory _salt, address implementationAuthority_) private returns (address) {
        bytes memory _code = type(IdentityRegistryStorageProxy).creationCode;
        bytes memory _constructData = abi.encode(implementationAuthority_);
        bytes memory bytecode = abi.encodePacked(_code, _constructData);
        return _deploy(_salt, bytecode);
    }

    /**
     * @notice Deploys an {IdentityRegistryProxy} via CREATE2 under `_salt`, wired to the
     *         provided trusted issuers registry, claim topics registry and identity storage.
     * @param _salt Deployment salt shared with the rest of the suite.
     * @param implementationAuthority_ Implementation authority encoded into the proxy
     *        constructor so the proxy can resolve its logic contract.
     * @param _trustedIssuersRegistry Trusted issuers registry the new identity registry will
     *        consult for claim issuer authorisation.
     * @param _claimTopicsRegistry Claim topics registry that defines which topics the identity
     *        registry enforces.
     * @param _identityStorage Identity registry storage that holds the actual identity records;
     *        may be reused across multiple identity registries.
     * @return Address of the deployed identity registry proxy.
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
