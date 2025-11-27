// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

// solhint-disable no-global-import
// solhint-disable no-empty-blocks
// solhint-disable private-vars-leading-underscore
import "@tokenysolutions/t-rex/contracts/factory/TREXFactory.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import { TRexIFactory, FactoryRegulationData } from "./interfaces/IFactory.sol";
import { TREXBondDeploymentLib } from "./libraries/TREXBondDeploymentLib.sol";
import { TREXEquityDeploymentLib } from "./libraries/TREXEquityDeploymentLib.sol";

/**
 * @author Tokeny Solutions
 * @notice Adapted from the T-REX official repository to deploy an ERC-3643-compatible ATS security token
 * @dev Uses tree-like structure with libraries as leaves instead of resolver proxy pattern for simplicity
 */
// solhint-disable custom-errors
contract TREXFactoryAts is ITREXFactory, Ownable {
    /// @notice TokenDetails with the ATS factory overlapping fields removed
    struct TokenDetailsAts {
        /// @dev Address of the owner of all contracts. The factory will append it to the provided RBACs if
        /// the T_REX_OWNER_ROLE is not found. For a cheaper deployment, add the owner at the first position
        /// in the array
        address owner;
        /// @dev Identity registry storage address. Set it to ZERO address if you want to deploy a new storage.
        /// If an address is provided, please ensure that the factory is set as owner of the contract
        address irs;
        /// @dev ONCHAINID of the token
        // solhint-disable-next-line var-name-mixedcase
        address ONCHAINID;
        /// @dev List of agents of the identity registry (can be set to an AgentManager contract)
        address[] irAgents;
        /// @dev List of agents of the token
        address[] tokenAgents;
        /// @dev Modules to bind to the compliance, indexes are corresponding to the settings
        /// callData indexes
        /// If a module doesn't require settings, it can be added at the end of the array, at index > settings.length
        address[] complianceModules;
        /// @dev Settings calls for compliance modules
        bytes[] complianceSettings;
    }

    /// @dev The address of the implementation authority contract used in the tokens deployed by the factory
    address private implementationAuthority;

    /// @dev The address of the Identity Factory used to deploy token OIDs
    address private idFactory;

    /// @dev Mapping containing info about the token contracts corresponding to salt already used for
    /// CREATE2 deployments
    mapping(string => address) public tokenDeployed;

    /// @dev The address of the ATS suite factory
    address private atsFactory;

    /**
     * @dev Constructor is setting the implementation authority and the Identity Factory of the TREX factory
     * @dev The constructor has been adjusted to allow null addresses later set by the owner
     */
    constructor(address _implementationAuthority, address _idFactory, address _atsFactory) {
        implementationAuthority = _implementationAuthority;
        idFactory = _idFactory;
        atsFactory = _atsFactory;
    }

    /**
     *  @dev See {ITREXFactory-deployTREXSuite}.
     *  @dev Disabled
     */
    function deployTREXSuite(
        string memory _salt,
        TokenDetails calldata _tokenDetails,
        ClaimDetails calldata _claimDetails
    ) external {}

    /**
     *  @dev See {ITREXFactory-deployTREXSuite}.
     *  @dev Original method adapted to deploy an ATS equity
     */
    function deployTREXSuiteAtsEquity(
        string memory _salt,
        TokenDetailsAts calldata _tokenDetails,
        ClaimDetails calldata _claimDetails,
        TRexIFactory.EquityData calldata _equityData,
        FactoryRegulationData calldata _factoryRegulationData
    ) external returns (address equityAddress_) {
        equityAddress_ = TREXEquityDeploymentLib.deployTREXSuiteAtsEquity(
            tokenDeployed,
            implementationAuthority,
            idFactory,
            atsFactory,
            _salt,
            _tokenDetails,
            _claimDetails,
            _equityData,
            _factoryRegulationData
        );
    }

    /**
     *  @dev See {ITREXFactory-deployTREXSuite}.
     *  @dev Original method adapted to deploy an ATS bond
     */
    function deployTREXSuiteAtsBond(
        string memory _salt,
        TokenDetailsAts calldata _tokenDetails,
        ClaimDetails calldata _claimDetails,
        TRexIFactory.BondData calldata _bondData,
        FactoryRegulationData calldata _factoryRegulationData
    ) external returns (address bondAddress_) {
        bondAddress_ = TREXBondDeploymentLib.deployTREXSuiteAtsBond(
            tokenDeployed,
            implementationAuthority,
            idFactory,
            atsFactory,
            _salt,
            _tokenDetails,
            _claimDetails,
            _bondData,
            _factoryRegulationData
        );
    }

    function recoverContractOwnership(address _contract, address _newOwner) external override onlyOwner {
        (Ownable(_contract)).transferOwnership(_newOwner);
    }

    function setImplementationAuthority(address _implementationAuthority) external override onlyOwner {
        require(_implementationAuthority != address(0), "invalid argument - zero address");
        // should not be possible to set an implementation authority that is not complete
        require(
            (ITREXImplementationAuthority(_implementationAuthority)).getCTRImplementation() != address(0) &&
                (ITREXImplementationAuthority(_implementationAuthority)).getIRImplementation() != address(0) &&
                (ITREXImplementationAuthority(_implementationAuthority)).getIRSImplementation() != address(0) &&
                (ITREXImplementationAuthority(_implementationAuthority)).getMCImplementation() != address(0) &&
                (ITREXImplementationAuthority(_implementationAuthority)).getTIRImplementation() != address(0),
            "invalid Implementation Authority"
        );
        implementationAuthority = _implementationAuthority;
        emit ImplementationAuthoritySet(_implementationAuthority);
    }

    function setIdFactory(address _idFactory) external override onlyOwner {
        require(_idFactory != address(0), "invalid argument - zero address");
        idFactory = _idFactory;
        emit IdFactorySet(_idFactory);
    }

    /**
     *  @dev Sets the address of the ATS factory
     */
    function setAtsFactory(address _atsFactory) external onlyOwner {
        require(_atsFactory != address(0), "invalid argument - zero address");
        atsFactory = _atsFactory;
    }

    function getImplementationAuthority() external view override returns (address) {
        return implementationAuthority;
    }

    function getIdFactory() external view override returns (address) {
        return idFactory;
    }

    function getToken(string calldata _salt) external view override returns (address) {
        return tokenDeployed[_salt];
    }
}
