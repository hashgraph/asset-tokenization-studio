// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for createBatchConfiguration and the ResolverProxy version
 * pinning it feeds. Rescued from the deleted externalFacetExtensibility suite —
 * these are the guards that protect real deployments:
 * - version=0 facets (never registered) must be rejected before sending a tx,
 *   because on-chain they only surface as a silent status=0 revert (underflow).
 * - configuration versions are tracked PER configuration ID in the BLR.
 * - deployResolverProxy refuses version 0 and pins explicitly resolved versions.
 *
 * @module test/scripts/integration/blrConfigurations.test
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { createBatchConfiguration, deployContract, deployResolverProxy, registerFacets } from "@lib/operations";
import { atsRegistry } from "@lib/domain";
import { deployBlrFixture } from "@test";
import { AccessControlFacet__factory, KycFacet__factory } from "@contract-types";

/** Deploy a facet and register it in the BLR under its registry resolver key. */
async function deployAndRegisterFacet(
  blr: Awaited<ReturnType<typeof deployBlrFixture>>["blr"],
  factory: AccessControlFacet__factory | KycFacet__factory,
  name: string,
) {
  const { address } = await deployContract(factory);
  const resolverKey = atsRegistry.getFacetDefinition(name)!.resolverKey!.value;
  await registerFacets(blr, { facets: [{ name, address, resolverKey }] });
  return { name, address, resolverKey };
}

describe("createBatchConfiguration - Integration Tests", () => {
  it("rejects facets with version 0 (never registered) before sending any transaction", async () => {
    const { deployer, blr } = await loadFixture(deployBlrFixture);
    await deployAndRegisterFacet(blr, new AccessControlFacet__factory(deployer), "AccessControlFacet");

    // The 0x0 resolver key was never registered, so its latest version is 0
    // and the guard must fire (on-chain this would panic with an underflow).
    await expect(
      createBatchConfiguration(blr, {
        configurationId: ethers.encodeBytes32String("ZERO_VERSION_CONFIG"),
        facets: [
          {
            facetName: "NonExistentFacet",
            address: "0x1234567890123456789012345678901234567890",
            resolverKey: "0x0000000000000000000000000000000000000000000000000000000000000000",
          },
        ],
      }),
    ).to.be.rejectedWith(/version 0.*NonExistentFacet/);
  });

  it("rejects an empty facet list", async () => {
    const { blr } = await loadFixture(deployBlrFixture);

    await expect(
      createBatchConfiguration(blr, {
        configurationId: ethers.encodeBytes32String("NO_FACETS"),
        facets: [],
      }),
    ).to.be.rejectedWith("At least one facet is required");
  });

  it("tracks configuration versions PER configuration ID", async () => {
    const { deployer, blr } = await loadFixture(deployBlrFixture);
    const accessControl = await deployAndRegisterFacet(
      blr,
      new AccessControlFacet__factory(deployer),
      "AccessControlFacet",
    );
    const kyc = await deployAndRegisterFacet(blr, new KycFacet__factory(deployer), "KycFacet");

    const firstConfigId = ethers.encodeBytes32String("FIRST_CONFIG");
    const firstConfig = await createBatchConfiguration(blr, {
      configurationId: firstConfigId,
      facets: [
        { facetName: accessControl.name, resolverKey: accessControl.resolverKey, address: accessControl.address },
      ],
    });
    expect(firstConfig.version).to.equal(Number(await blr.getLatestVersionByConfiguration(firstConfigId)));
    expect(firstConfig.version).to.equal(1);

    // The second configuration must start at version 1 too — versions are
    // per-config, not global (regression guard for a real bug).
    const secondConfigId = ethers.encodeBytes32String("SECOND_CONFIG");
    const secondConfig = await createBatchConfiguration(blr, {
      configurationId: secondConfigId,
      facets: [{ facetName: kyc.name, resolverKey: kyc.resolverKey, address: kyc.address }],
    });
    expect(secondConfig.version).to.equal(Number(await blr.getLatestVersionByConfiguration(secondConfigId)));
    expect(secondConfig.version).to.equal(1);
  });
});

describe("deployResolverProxy version pinning", () => {
  it("rejects version 0 with an explicit guard error", async () => {
    const { deployer, blr, blrAddress } = await loadFixture(deployBlrFixture);
    const facet = await deployAndRegisterFacet(blr, new AccessControlFacet__factory(deployer), "AccessControlFacet");

    const configId = ethers.encodeBytes32String("TEST_CONFIG_REJECT_ZERO");
    await createBatchConfiguration(blr, {
      configurationId: configId,
      facets: [{ facetName: facet.name, resolverKey: facet.resolverKey, address: facet.address }],
    });

    await expect(
      deployResolverProxy(deployer, { blrAddress, configurationId: configId, version: 0, rbac: [] }),
    ).to.be.rejectedWith(/'version' must be an integer >= 1/);
  });

  it("resolves the latest registered version explicitly and pins it", async () => {
    const { deployer, blr, blrAddress } = await loadFixture(deployBlrFixture);
    const facet = await deployAndRegisterFacet(blr, new KycFacet__factory(deployer), "KycFacet");

    const configId = ethers.encodeBytes32String("EXPLICIT_LATEST_TEST");
    await createBatchConfiguration(blr, {
      configurationId: configId,
      facets: [{ facetName: facet.name, resolverKey: facet.resolverKey, address: facet.address }],
    });

    const latest = Number(await blr.getLatestVersionByConfiguration(configId));
    expect(latest).to.be.greaterThan(0);

    const result = await deployResolverProxy(deployer, {
      blrAddress,
      configurationId: configId,
      version: latest,
      rbac: [],
    });

    expect(result.proxyAddress).to.exist;
    expect(await ethers.provider.getCode(result.proxyAddress)).to.not.equal("0x");
  });
});
