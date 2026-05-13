// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKyc } from "./IKyc.sol";
import { Kyc } from "./Kyc.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../../infrastructure/proxy/Bytes4Builder.sol";
import { _KYC_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";

contract KycFacet is Kyc, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _KYC_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeInternalKyc.selector,
                this.activateInternalKyc.selector,
                this.deactivateInternalKyc.selector,
                this.grantKyc.selector,
                this.revokeKyc.selector,
                this.getKycFor.selector,
                this.getKycStatusFor.selector,
                this.getKycAccountsCount.selector,
                this.getKycAccountsData.selector,
                this.isInternalKycActivated.selector
            );
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IKyc).interfaceId);
    }
}
