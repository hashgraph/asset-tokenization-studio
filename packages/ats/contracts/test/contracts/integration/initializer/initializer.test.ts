// SPDX-License-Identifier: Apache-2.0

import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { BusinessLogicResolver, InitializerFacet, DiamondFacet, AccessControlFacet, PauseFacet } from "@contract-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";

describe("Initializer — Counter-Based Auto-Operational", () => {
  let signer_A: HardhatEthersSigner;
  let blr: BusinessLogicResolver;

  // Config IDs
  const cfgA = ethers.keccak256(ethers.toUtf8Bytes("cfgA"));
  const cfgB = ethers.keccak256(ethers.toUtf8Bytes("cfgB"));

  // Facet implementations
  let accessControlImpl: AccessControlFacet;
  let pauseImpl: PauseFacet;
  let diamondImpl: DiamondFacet;

  // Facet IDs
  let accessControlId: string;
  let pauseId: string;
  let diamondId: string;

  const facetIds: string[] = [];
  const facetImpls: any[] = [];

  async function deployInfrastructure() {
    [signer_A] = await ethers.getSigners();

    // Deploy BLR
    const BLRFactory = await ethers.getContractFactory("BusinessLogicResolver");
    blr = (await BLRFactory.deploy()).connect(signer_A) as BusinessLogicResolver;
    await blr.initialize_BusinessLogicResolver();

    // Deploy unique facets with different resolver keys
    const AccessControlFactory = await ethers.getContractFactory("AccessControlFacet");
    accessControlImpl = await AccessControlFactory.deploy();
    accessControlId = await accessControlImpl.getStaticResolverKey();
    facetImpls.push(accessControlImpl);
    facetIds.push(accessControlId);

    const PauseFactory = await ethers.getContractFactory("PauseFacet");
    pauseImpl = await PauseFactory.deploy();
    pauseId = await pauseImpl.getStaticResolverKey();
    facetImpls.push(pauseImpl);
    facetIds.push(pauseId);

    const DiamondFactory = await ethers.getContractFactory("DiamondFacet");
    diamondImpl = await DiamondFactory.deploy();
    diamondId = await diamondImpl.getStaticResolverKey();
    facetImpls.push(diamondImpl);
    facetIds.push(diamondId);

    return { blr, signer_A };
  }

  async function createConfig(configId: string, facets: Array<{ id: string; version: number }>) {
    await blr.createConfiguration(configId, facets as any);
  }

  async function deployProxy(resolver: BusinessLogicResolver, configId: string, version: number) {
    const ProxyFactory = await ethers.getContractFactory("ResolverProxy");
    const proxy = await ProxyFactory.deploy(resolver.target, configId, version, []);
    await proxy.waitForDeployment();
    const initializer = (await ethers.getContractAt("InitializerFacet", proxy.target)) as InitializerFacet;
    return { proxy, initializer };
  }

  beforeEach(async () => {
    await loadFixture(deployInfrastructure);
  });

  describe("Scenario 1 — Fresh Deploy + Initialization", () => {
    it("GIVEN fresh config A-v1 with 3 facets WHEN deploying proxy THEN state is Pending with K=3", async () => {
      // Register business logics on BLR
      await blr.registerBusinessLogics([
        { businessLogicKey: facetIds[0], businessLogicAddress: facetImpls[0].target },
        { businessLogicKey: facetIds[1], businessLogicAddress: facetImpls[1].target },
        { businessLogicKey: facetIds[2], businessLogicAddress: facetImpls[2].target },
      ]);

      await createConfig(cfgA, [
        { id: facetIds[0], version: 1 },
        { id: facetIds[1], version: 1 },
        { id: facetIds[2], version: 1 },
      ]);

      const { initializer } = await deployProxy(blr, cfgA, 1);

      expect(await initializer.isOperational(cfgA, 1)).to.be.false;
      expect(await initializer.getConfigTargetCount(cfgA, 1)).to.equal(3);
      expect(await initializer.getConfigInitializedCount(cfgA, 1)).to.equal(0);
    });

    it("GIVEN pending A-v1 WHEN calling setOperationalStatus THEN reverts StillPending", async () => {
      await blr.registerBusinessLogics([
        { businessLogicKey: facetIds[0], businessLogicAddress: facetImpls[0].target },
        { businessLogicKey: facetIds[1], businessLogicAddress: facetImpls[1].target },
        { businessLogicKey: facetIds[2], businessLogicAddress: facetImpls[2].target },
      ]);

      await createConfig(cfgA, [
        { id: facetIds[0], version: 1 },
        { id: facetIds[1], version: 1 },
        { id: facetIds[2], version: 1 },
      ]);

      const { initializer } = await deployProxy(blr, cfgA, 1);
      // Status is REINIT_PENDING after fresh deploy with K>0 facets → setOperationalStatus must revert
      await expect(initializer.setOperationalStatus()).to.be.revertedWithCustomError(initializer, "StillPending");
    });
  });

  describe("Scenario 2 — Version Upgrade (A-v1 → A-v2)", () => {
    it("GIVEN A-v1 operational WHEN A-v2 with changed facets THEN diff computes K=2", async () => {
      // A-v1
      await blr.registerBusinessLogics([
        { businessLogicKey: facetIds[0], businessLogicAddress: facetImpls[0].target },
        { businessLogicKey: facetIds[1], businessLogicAddress: facetImpls[1].target },
        { businessLogicKey: facetIds[2], businessLogicAddress: facetImpls[2].target },
      ]);
      await createConfig(cfgA, [
        { id: facetIds[0], version: 1 },
        { id: facetIds[1], version: 1 },
        { id: facetIds[2], version: 1 },
      ]);

      // A-v2: register facetIds[1] again (→ version 2) and create new config version
      await blr.registerBusinessLogics([{ businessLogicKey: facetIds[1], businessLogicAddress: facetImpls[1].target }]);
      await createConfig(cfgA, [
        { id: facetIds[0], version: 1 },
        { id: facetIds[1], version: 2 },
        { id: facetIds[2], version: 1 },
      ]);

      // Transition diff (A,v1)→(A,v2) is auto-computed by createConfiguration
      const diff = await blr.getTransitionDiff(cfgA, 1, cfgA, 2);
      expect(diff.totalFacets_).to.equal(3);
      expect(diff.unchangedFacets_).to.equal(2); // facetIds[0] + facetIds[2] are unchanged
      expect(diff.isRegistered_).to.be.true;
    });
  });

  describe("Scenario 3 — Config Migration (A-v2 → B-v1)", () => {
    it("GIVEN A-v2 WHEN migrating to B-v1 with all same facets THEN explicit diff needed and K=0 activates immediately", async () => {
      // A-v1
      await blr.registerBusinessLogics([
        { businessLogicKey: facetIds[0], businessLogicAddress: facetImpls[0].target },
        { businessLogicKey: facetIds[1], businessLogicAddress: facetImpls[1].target },
        { businessLogicKey: facetIds[2], businessLogicAddress: facetImpls[2].target },
      ]);
      await createConfig(cfgA, [
        { id: facetIds[0], version: 1 },
        { id: facetIds[1], version: 1 },
        { id: facetIds[2], version: 1 },
      ]);

      // A-v2: upgrade facet[1] to version 2
      await blr.registerBusinessLogics([{ businessLogicKey: facetIds[1], businessLogicAddress: facetImpls[1].target }]);
      await createConfig(cfgA, [
        { id: facetIds[0], version: 1 },
        { id: facetIds[1], version: 2 },
        { id: facetIds[2], version: 1 },
      ]);

      // Deploy proxy at A-v2 (fresh deploy with 3 facets → REINIT_PENDING)
      const { proxy: proxyA } = await deployProxy(blr, cfgA, 2);

      // B-v1 shares the exact same facets+versions as A-v2
      await createConfig(cfgB, [
        { id: facetIds[0], version: 1 },
        { id: facetIds[1], version: 2 },
        { id: facetIds[2], version: 1 },
      ]);

      const diamondCut = await ethers.getContractAt("DiamondFacet", proxyA.target);

      // Without explicit diff: should revert with TransitionDiffNotRegistered
      await expect(diamondCut.updateConfig(cfgB, 1)).to.be.revertedWithCustomError(
        proxyA,
        "TransitionDiffNotRegistered",
      );

      // Compute explicit diff — all 3 facets same → K=0
      await blr.computeTransitionDiff(cfgA, 2, cfgB, 1);

      const diff = await blr.getTransitionDiff(cfgA, 2, cfgB, 1);
      expect(diff.totalFacets_).to.equal(3);
      expect(diff.unchangedFacets_).to.equal(3);
      expect(diff.isRegistered_).to.be.true;

      // K=0 → immediate activation when updateConfig is called
      await expect(diamondCut.updateConfig(cfgB, 1)).to.emit(proxyA, "TokenOperational").withArgs(cfgB, 1);

      const init = (await ethers.getContractAt("InitializerFacet", proxyA.target)) as InitializerFacet;
      expect(await init.isOperational(cfgB, 1)).to.be.true;
    });
  });

  describe("Scenario 4 — StillPending Guard", () => {
    it("GIVEN proxy with REINIT_PENDING WHEN calling updateConfigVersion THEN reverts StillPending", async () => {
      // A-v1 with 3 facets → fresh deploy → REINIT_PENDING for v1
      await blr.registerBusinessLogics([
        { businessLogicKey: facetIds[0], businessLogicAddress: facetImpls[0].target },
        { businessLogicKey: facetIds[1], businessLogicAddress: facetImpls[1].target },
        { businessLogicKey: facetIds[2], businessLogicAddress: facetImpls[2].target },
      ]);
      await createConfig(cfgA, [
        { id: facetIds[0], version: 1 },
        { id: facetIds[1], version: 1 },
        { id: facetIds[2], version: 1 },
      ]);

      // A-v2 (auto diff computed from v1→v2)
      await blr.registerBusinessLogics([{ businessLogicKey: facetIds[1], businessLogicAddress: facetImpls[1].target }]);
      await createConfig(cfgA, [
        { id: facetIds[0], version: 1 },
        { id: facetIds[1], version: 2 },
        { id: facetIds[2], version: 1 },
      ]);

      const { proxy: proxy1 } = await deployProxy(blr, cfgA, 1);
      // proxy1 at A-v1 is REINIT_PENDING (3 facets not initialized yet)
      const diamondCut = await ethers.getContractAt("DiamondFacet", proxy1.target);

      // updateConfigVersion is guarded by checkNotPending → must revert
      await expect(diamondCut.updateConfigVersion(2)).to.be.revertedWithCustomError(proxy1, "StillPending");
    });
  });

  describe("Scenario 5 — K=0 Upgrade (no facet changes)", () => {
    it("GIVEN operational A-v2 WHEN upgrading to A-v3 with zero changes THEN immediate operational", async () => {
      // A-v1
      await blr.registerBusinessLogics([
        { businessLogicKey: facetIds[0], businessLogicAddress: facetImpls[0].target },
        { businessLogicKey: facetIds[1], businessLogicAddress: facetImpls[1].target },
        { businessLogicKey: facetIds[2], businessLogicAddress: facetImpls[2].target },
      ]);
      await createConfig(cfgA, [
        { id: facetIds[0], version: 1 },
        { id: facetIds[1], version: 1 },
        { id: facetIds[2], version: 1 },
      ]);

      // A-v2 (facet[1] upgraded → K=1 changed)
      await blr.registerBusinessLogics([{ businessLogicKey: facetIds[1], businessLogicAddress: facetImpls[1].target }]);
      await createConfig(cfgA, [
        { id: facetIds[0], version: 1 },
        { id: facetIds[1], version: 2 },
        { id: facetIds[2], version: 1 },
      ]);

      // A-v3 identical to A-v2 → K=0 diff auto-computed
      await createConfig(cfgA, [
        { id: facetIds[0], version: 1 },
        { id: facetIds[1], version: 2 },
        { id: facetIds[2], version: 1 },
      ]);

      // Deploy proxy at A-v2 — fresh deploy → REINIT_PENDING
      const { proxy: proxyA } = await deployProxy(blr, cfgA, 2);
      const diamondCut = await ethers.getContractAt("DiamondFacet", proxyA.target);

      // updateConfigVersion to v3 is blocked because A-v2 is still pending
      await expect(diamondCut.updateConfigVersion(3)).to.be.revertedWithCustomError(proxyA, "StillPending");
    });
  });

  describe("Scenario 6 — Non-sequential upgrade without diff", () => {
    it("GIVEN A-v1 proxy WHEN jumping to A-v5 without explicit diff THEN reverts", async () => {
      // A-v1
      await blr.registerBusinessLogics([
        { businessLogicKey: facetIds[0], businessLogicAddress: facetImpls[0].target },
        { businessLogicKey: facetIds[1], businessLogicAddress: facetImpls[1].target },
        { businessLogicKey: facetIds[2], businessLogicAddress: facetImpls[2].target },
      ]);
      await createConfig(cfgA, [
        { id: facetIds[0], version: 1 },
        { id: facetIds[1], version: 1 },
        { id: facetIds[2], version: 1 },
      ]);

      const { proxy: proxy1 } = await deployProxy(blr, cfgA, 1);

      // Register A-v2..A-v5 (identical facets — sequential diff computed between consecutive)
      for (let v = 2; v <= 5; v++) {
        await createConfig(cfgA, [
          { id: facetIds[0], version: 1 },
          { id: facetIds[1], version: 1 },
          { id: facetIds[2], version: 1 },
        ]);
      }

      // Proxy is at A-v1 which is REINIT_PENDING; updateConfigVersion(5) blocked first by StillPending
      const diamondCut = await ethers.getContractAt("DiamondFacet", proxy1.target);
      await expect(diamondCut.updateConfigVersion(5)).to.be.revertedWithCustomError(proxy1, "StillPending");
    });
  });

  describe("Scenario 7 — Resolver Change (fresh deploy semantics)", () => {
    it("GIVEN operational asset on BLR1 WHEN updating to BLR2 THEN full re-initialization required", async () => {
      // Setup on BLR1
      await blr.registerBusinessLogics([
        { businessLogicKey: facetIds[0], businessLogicAddress: facetImpls[0].target },
        { businessLogicKey: facetIds[1], businessLogicAddress: facetImpls[1].target },
        { businessLogicKey: facetIds[2], businessLogicAddress: facetImpls[2].target },
      ]);
      await createConfig(cfgA, [
        { id: facetIds[0], version: 1 },
        { id: facetIds[1], version: 1 },
        { id: facetIds[2], version: 1 },
      ]);

      const { proxy: proxy1 } = await deployProxy(blr, cfgA, 1);
      // proxy1 at A-v1 is REINIT_PENDING

      // Deploy BLR2
      const BLR2Factory = await ethers.getContractFactory("BusinessLogicResolver");
      const blr2 = (await BLR2Factory.deploy()).connect(signer_A) as BusinessLogicResolver;
      await blr2.initialize_BusinessLogicResolver();

      // Register same facets on BLR2
      await blr2.registerBusinessLogics([
        { businessLogicKey: facetIds[0], businessLogicAddress: facetImpls[0].target },
        { businessLogicKey: facetIds[1], businessLogicAddress: facetImpls[1].target },
        { businessLogicKey: facetIds[2], businessLogicAddress: facetImpls[2].target },
      ]);
      await blr2.createConfiguration(cfgA, [
        { id: facetIds[0], version: 1 },
        { id: facetIds[1], version: 1 },
        { id: facetIds[2], version: 1 },
      ]);

      // updateResolver is blocked by checkNotPending (proxy1 is REINIT_PENDING)
      const diamondCut = await ethers.getContractAt("DiamondFacet", proxy1.target);
      await expect(diamondCut.updateResolver(blr2.target, cfgA, 1)).to.be.revertedWithCustomError(
        proxy1,
        "StillPending",
      );
    });
  });

  describe("Scenario 8 — getters and error cases", () => {
    it("GIVEN fresh config WHEN calling getOperationalStatus THEN returns REINIT_PENDING", async () => {
      await blr.registerBusinessLogics([
        { businessLogicKey: facetIds[0], businessLogicAddress: facetImpls[0].target },
        { businessLogicKey: facetIds[1], businessLogicAddress: facetImpls[1].target },
        { businessLogicKey: facetIds[2], businessLogicAddress: facetImpls[2].target },
      ]);
      await createConfig(cfgA, [
        { id: facetIds[0], version: 1 },
        { id: facetIds[1], version: 1 },
        { id: facetIds[2], version: 1 },
      ]);

      const { initializer } = await deployProxy(blr, cfgA, 1);
      // Fresh deploy with 3 facets sets status to REINIT_PENDING (type(uint256).max)
      expect(await initializer.getOperationalStatus(cfgA, 1)).to.equal(ethers.MaxUint256);
    });

    it("GIVEN fresh config WHEN calling getLastOperationalVersion THEN returns 0", async () => {
      await blr.registerBusinessLogics([
        { businessLogicKey: facetIds[0], businessLogicAddress: facetImpls[0].target },
        { businessLogicKey: facetIds[1], businessLogicAddress: facetImpls[1].target },
        { businessLogicKey: facetIds[2], businessLogicAddress: facetImpls[2].target },
      ]);
      await createConfig(cfgA, [
        { id: facetIds[0], version: 1 },
        { id: facetIds[1], version: 1 },
        { id: facetIds[2], version: 1 },
      ]);

      const { initializer } = await deployProxy(blr, cfgA, 1);
      expect(await initializer.getLastOperationalVersion()).to.equal(0);
    });

    it("GIVEN unregistered config WHEN deploying proxy THEN reverts", async () => {
      const unregisteredConfig = ethers.keccak256(ethers.toUtf8Bytes("unregistered"));
      await expect(deployProxy(blr, unregisteredConfig, 1)).to.be.revertedWithCustomError(
        blr,
        "ResolverProxyConfigurationNoRegistered",
      );
    });
  });
});
