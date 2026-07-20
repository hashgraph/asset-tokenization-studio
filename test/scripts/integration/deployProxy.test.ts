// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for deployProxy: the implementation + ProxyAdmin + proxy
 * composition and the reuse of an existing ProxyAdmin. Rescued from the
 * deleted deploymentSystem suite (this was its only unique coverage).
 *
 * @module test/scripts/integration/deployProxy.test
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import type { Signer } from "ethers";
import { deployProxy } from "@lib/operations";
import { BusinessLogicResolver__factory, FactoryFacet__factory } from "@contract-types";

describe("deployProxy - Integration Tests", () => {
  let deployer: Signer;

  beforeEach(async () => {
    [deployer] = await ethers.getSigners();
  });

  it("deploys the complete proxy setup (implementation, proxy, proxyAdmin)", async () => {
    const result = await deployProxy(deployer, {
      implementationFactory: new BusinessLogicResolver__factory(deployer),
    });

    expect(result.implementation).to.exist;
    expect(result.implementationAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
    expect(result.proxy).to.exist;
    expect(result.proxyAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
    expect(result.proxyAdmin).to.exist;
    expect(result.proxyAdminAddress).to.match(/^0x[a-fA-F0-9]{40}$/);

    // One receipt per piece actually deployed
    expect(result.receipts.implementation).to.exist;
    expect(result.receipts.proxy).to.exist;
    expect(result.receipts.proxyAdmin).to.exist;

    // Three distinct contracts
    expect(result.implementationAddress).to.not.equal(result.proxyAddress);
    expect(result.proxyAddress).to.not.equal(result.proxyAdminAddress);
  });

  it("reuses an existing ProxyAdmin when provided", async () => {
    const result1 = await deployProxy(deployer, {
      implementationFactory: new BusinessLogicResolver__factory(deployer),
    });

    const result2 = await deployProxy(deployer, {
      implementationFactory: new FactoryFacet__factory(deployer),
      existingProxyAdmin: result1.proxyAdmin,
    });

    expect(result2.proxyAdminAddress).to.equal(result1.proxyAdminAddress);
    // Nothing was deployed for the admin, so there is no receipt for it
    expect(result2.receipts.proxyAdmin).to.not.exist;
  });
});
