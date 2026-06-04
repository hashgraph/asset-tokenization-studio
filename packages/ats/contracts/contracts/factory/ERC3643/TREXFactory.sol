// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

// solhint-disable no-global-import
// solhint-disable no-empty-blocks
// solhint-disable private-vars-leading-underscore
import "@tokenysolutions/t-rex/contracts/factory/TREXFactory.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @author Tokeny Solutions
 * @notice Adapted from the T-REX official repository to deploy an ERC-3643-compatible ATS security token
 * @dev Uses tree-like structure with libraries as leaves instead of resolver proxy pattern for simplicity
 */
// solhint-disable custom-errors
contract TREXFactoryAts is ITREXFactory, Ownable {
    /// @dev The address of the implementation authority contract used in the tokens deployed by the factory
    address private implementationAuthority;

    /// @dev The address of the Identity Factory used to deploy token OIDs
    address private idFactory;

    /// @dev Mapping containing info about the token contracts corresponding to salt already used for
    /// CREATE2 deployments
    mapping(string => address) public tokenDeployed;

    /**
     * @dev Constructor is setting the implementation authority and the Identity Factory of the TREX factory
     * @dev The constructor has been adjusted to allow null addresses later set by the owner
     */
    constructor(address _implementationAuthority, address _idFactory) {
        implementationAuthority = _implementationAuthority;
        idFactory = _idFactory;
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
