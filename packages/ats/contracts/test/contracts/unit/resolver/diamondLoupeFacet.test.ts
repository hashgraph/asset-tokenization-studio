import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers.js";
import { DiamondLoupeFacet } from "@contract-types";
import { deployEquityTokenFixture } from "test/fixtures";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("DiamondLoupeFacet", () => {
  let signer_A: SignerWithAddress;

  let diamondLoupe: DiamondLoupeFacet;

  before(async () => {
    const base = await loadFixture(deployEquityTokenFixture);
    signer_A = base.deployer;

    diamondLoupe = await ethers.getContractAt("DiamondLoupeFacet", base.diamond.address, signer_A);
  });

  describe("getFacets functionality", () => {
    it("GIVEN a resolver WHEN getting all facets THEN returns correct facets", async () => {
      const facets = await diamondLoupe.getFacets();

      expect(facets.length).to.be.greaterThan(0);

      for (const facet of facets) {
        expect(facet.id).to.exist;
        expect(facet.addr).to.exist;
        expect(facet.addr).to.not.equal("0x0000000000000000000000000000000000000000");
        expect(facet.selectors).to.exist;
        expect(facet.selectors.length).to.be.greaterThan(0);
        expect(facet.interfaceIds).to.exist;
      }
    });

    it("GIVEN a resolver WHEN getting facets length THEN returns correct count", async () => {
      const facetsLength = await diamondLoupe.getFacetsLength();
      const facets = await diamondLoupe.getFacets();

      expect(facetsLength.toNumber()).to.equal(facets.length);
      expect(facetsLength.toNumber()).to.be.greaterThan(0);
    });

    it("GIVEN a resolver WHEN getting facets by page THEN returns paginated results", async () => {
      const facetsLength = await diamondLoupe.getFacetsLength();
      const allFacets = await diamondLoupe.getFacets();

      const pageLength = 2;
      const firstPage = await diamondLoupe.getFacetsByPage(0, pageLength);

      expect(firstPage.length).to.equal(Math.min(pageLength, facetsLength.toNumber()));

      for (let i = 0; i < firstPage.length; i++) {
        expect(firstPage[i].id).to.equal(allFacets[i].id);
        expect(firstPage[i].addr).to.equal(allFacets[i].addr);
      }

      if (facetsLength.toNumber() > pageLength) {
        const secondPage = await diamondLoupe.getFacetsByPage(pageLength - 1, pageLength);
        expect(secondPage.length).to.be.greaterThan(0);

        for (let i = 0; i < secondPage.length && pageLength + i < allFacets.length; i++) {
          expect(secondPage[i].id).to.equal(allFacets[pageLength + i].id);
        }
      }
    });
  });

  describe("getFacetSelectors functionality", () => {
    it("GIVEN a resolver WHEN getting facet selectors THEN returns correct selectors", async () => {
      const facets = await diamondLoupe.getFacets();
      expect(facets.length).to.be.greaterThan(0);

      const facetId = facets[0].id;
      const selectors = await diamondLoupe.getFacetSelectors(facetId);

      expect(selectors.length).to.be.greaterThan(0);
      expect(selectors.length).to.equal(facets[0].selectors.length);
      expect(selectors).to.have.members(facets[0].selectors);
    });

    it("GIVEN a resolver WHEN getting facet selectors length THEN returns correct count", async () => {
      const facets = await diamondLoupe.getFacets();
      const facetId = facets[0].id;

      const selectorsLength = await diamondLoupe.getFacetSelectorsLength(facetId);
      const selectors = await diamondLoupe.getFacetSelectors(facetId);

      expect(selectorsLength.toNumber()).to.equal(selectors.length);
      expect(selectorsLength.toNumber()).to.be.greaterThan(0);
    });

    it("GIVEN a resolver WHEN getting facet selectors by page THEN returns paginated selectors", async () => {
      const facets = await diamondLoupe.getFacets();
      const facetId = facets[0].id;
      const allSelectors = await diamondLoupe.getFacetSelectors(facetId);

      const pageLength = 2;
      const firstPage = await diamondLoupe.getFacetSelectorsByPage(facetId, 0, pageLength);

      expect(firstPage.length).to.equal(Math.min(pageLength, allSelectors.length));

      for (let i = 0; i < firstPage.length; i++) {
        expect(firstPage[i]).to.equal(allSelectors[i]);
      }
    });
  });

  describe("getFacetIds functionality", () => {
    it("GIVEN a resolver WHEN getting facet IDs THEN returns all facet IDs", async () => {
      const facetIds = await diamondLoupe.getFacetIds();
      const facets = await diamondLoupe.getFacets();

      expect(facetIds.length).to.equal(facets.length);

      const facetIdsFromFacets = facets.map((f) => f.id);
      expect(facetIds).to.have.members(facetIdsFromFacets);
    });

    it("GIVEN a resolver WHEN getting facet IDs by page THEN returns paginated IDs", async () => {
      const allIds = await diamondLoupe.getFacetIds();
      const pageLength = 2;
      const firstPage = await diamondLoupe.getFacetIdsByPage(0, pageLength);

      expect(firstPage.length).to.equal(Math.min(pageLength, allIds.length));

      for (let i = 0; i < firstPage.length; i++) {
        expect(firstPage[i]).to.equal(allIds[i]);
      }
    });
  });

  describe("getFacetAddresses functionality", () => {
    it("GIVEN a resolver WHEN getting facet addresses THEN returns all addresses", async () => {
      const facetAddresses = await diamondLoupe.getFacetAddresses();
      const facets = await diamondLoupe.getFacets();

      expect(facetAddresses.length).to.equal(facets.length);

      const addressesFromFacets = facets.map((f) => f.addr);
      expect(facetAddresses).to.have.members(addressesFromFacets);

      for (const addr of facetAddresses) {
        expect(addr).to.not.equal("0x0000000000000000000000000000000000000000");
      }
    });

    it("GIVEN a resolver WHEN getting facet addresses by page THEN returns paginated addresses", async () => {
      const allAddresses = await diamondLoupe.getFacetAddresses();
      const pageLength = 2;
      const firstPage = await diamondLoupe.getFacetAddressesByPage(0, pageLength);

      expect(firstPage.length).to.equal(Math.min(pageLength, allAddresses.length));

      for (let i = 0; i < firstPage.length; i++) {
        expect(firstPage[i]).to.equal(allAddresses[i]);
      }
    });
  });

  describe("getFacet and getFacetAddress functionality", () => {
    it("GIVEN a resolver WHEN getting facet by ID THEN returns correct facet", async () => {
      const allFacets = await diamondLoupe.getFacets();
      const testFacetId = allFacets[0].id;

      const facet = await diamondLoupe.getFacet(testFacetId);

      expect(facet.id).to.equal(testFacetId);
      expect(facet.addr).to.equal(allFacets[0].addr);
      expect(facet.selectors).to.have.members(allFacets[0].selectors);
      expect(facet.interfaceIds).to.have.members(allFacets[0].interfaceIds);
    });

    it("GIVEN a resolver WHEN getting facet address by selector THEN returns correct address", async () => {
      const allFacets = await diamondLoupe.getFacets();
      const testFacet = allFacets[0];
      const testSelector = testFacet.selectors[0];

      const facetAddress = await diamondLoupe.getFacetAddress(testSelector);

      expect(facetAddress).to.equal(testFacet.addr);
      expect(facetAddress).to.not.equal("0x0000000000000000000000000000000000000000");
    });

    it("GIVEN a resolver WHEN getting facet ID by selector THEN returns correct ID", async () => {
      const allFacets = await diamondLoupe.getFacets();
      const testFacet = allFacets[0];
      const testSelector = testFacet.selectors[0];

      const facetId = await diamondLoupe.getFacetIdBySelector(testSelector);

      expect(facetId).to.equal(testFacet.id);
    });

    it("GIVEN a resolver WHEN getting facet address for non-existent selector THEN returns zero address", async () => {
      const nonExistentSelector = "0x00000001";
      const facetAddress = await diamondLoupe.getFacetAddress(nonExistentSelector);

      expect(facetAddress).to.equal("0x0000000000000000000000000000000000000000");
    });
  });

  describe("supportsInterface functionality", () => {
    it("GIVEN a resolver WHEN checking supported interface THEN returns true for valid interfaces", async () => {
      const allFacets = await diamondLoupe.getFacets();

      for (const facet of allFacets) {
        for (const interfaceId of facet.interfaceIds) {
          const isSupported = await diamondLoupe.supportsInterface(interfaceId);
          expect(isSupported).to.be.true;
        }
      }
    });

    it("GIVEN a resolver WHEN checking non-existent interface THEN returns false", async () => {
      const nonExistentInterfaceId = "0x00000001";
      const isSupported = await diamondLoupe.supportsInterface(nonExistentInterfaceId);

      expect(isSupported).to.be.false;
    });

    it("GIVEN a resolver WHEN checking ERC165 interface THEN returns true", async () => {
      const erc165InterfaceId = "0x01ffc9a7";
      const isSupported = await diamondLoupe.supportsInterface(erc165InterfaceId);

      expect(isSupported).to.be.true;
    });

    it("GIVEN a resolver WHEN checking IAccessControl interface THEN returns true", async () => {
      const diamondLoupeInterfaceId = "0xd1496c36"; // IAccessControl interface ID
      const isSupported = await diamondLoupe.supportsInterface(diamondLoupeInterfaceId);

      expect(isSupported).to.be.true;
    });
  });

  describe("Cross-validation tests", () => {
    it("GIVEN a resolver WHEN validating consistency across methods THEN all data matches", async () => {
      const facets = await diamondLoupe.getFacets();
      const facetIds = await diamondLoupe.getFacetIds();
      const facetAddresses = await diamondLoupe.getFacetAddresses();
      const facetsLength = await diamondLoupe.getFacetsLength();

      expect(facets.length).to.equal(facetsLength.toNumber());
      expect(facetIds.length).to.equal(facetsLength.toNumber());
      expect(facetAddresses.length).to.equal(facetsLength.toNumber());

      for (let i = 0; i < facets.length; i++) {
        expect(facets[i].id).to.equal(facetIds[i]);
        expect(facets[i].addr).to.equal(facetAddresses[i]);

        const individualFacet = await diamondLoupe.getFacet(facets[i].id);
        expect(individualFacet.id).to.equal(facets[i].id);
        expect(individualFacet.addr).to.equal(facets[i].addr);
        expect(individualFacet.selectors).to.have.members(facets[i].selectors);

        const selectorsLength = await diamondLoupe.getFacetSelectorsLength(facets[i].id);
        expect(selectorsLength.toNumber()).to.equal(facets[i].selectors.length);

        const selectors = await diamondLoupe.getFacetSelectors(facets[i].id);
        expect(selectors).to.have.members(facets[i].selectors);

        for (const selector of facets[i].selectors) {
          const facetAddress = await diamondLoupe.getFacetAddress(selector);
          expect(facetAddress).to.equal(facets[i].addr);

          const facetId = await diamondLoupe.getFacetIdBySelector(selector);
          expect(facetId).to.equal(facets[i].id);
        }
      }
    });

    it("GIVEN a resolver WHEN validating selectors THEN no selector is registered multiple times", async () => {
      const facets = await diamondLoupe.getFacets();
      const allSelectors: string[] = [];

      for (const facet of facets) {
        for (const selector of facet.selectors) {
          expect(allSelectors).to.not.include(selector, `Selector ${selector} is registered in multiple facets`);
          allSelectors.push(selector);
        }
      }

      expect(allSelectors.length).to.be.greaterThan(0);
    });

    it("GIVEN a resolver WHEN validating facet IDs THEN no facet ID is registered multiple times", async () => {
      const facetIds = await diamondLoupe.getFacetIds();
      const uniqueFacetIds = new Set(facetIds);

      expect(facetIds.length).to.equal(uniqueFacetIds.size, "Some facet IDs are registered multiple times");
    });

    it("GIVEN a resolver WHEN validating interface IDs THEN all are properly registered", async () => {
      const facets = await diamondLoupe.getFacets();

      for (const facet of facets) {
        for (const interfaceId of facet.interfaceIds) {
          const isSupported = await diamondLoupe.supportsInterface(interfaceId);
          expect(isSupported).to.be.true;
        }
      }
    });
  });

  describe("Edge cases and boundary tests", () => {
    it("GIVEN a resolver WHEN getting facets by page with zero length THEN returns empty array", async () => {
      const facets = await diamondLoupe.getFacetsByPage(0, 0);
      expect(facets.length).to.equal(0);
    });

    it("GIVEN a resolver WHEN getting facets by page beyond available data THEN returns empty array", async () => {
      const facetsLength = await diamondLoupe.getFacetsLength();
      const facets = await diamondLoupe.getFacetsByPage(facetsLength.toNumber() + 100, 10);
      expect(facets.length).to.equal(0);
    });

    it("GIVEN a resolver WHEN getting facet selectors by page with zero length THEN returns empty array", async () => {
      const allFacets = await diamondLoupe.getFacets();
      const facetId = allFacets[0].id;

      const selectors = await diamondLoupe.getFacetSelectorsByPage(facetId, 0, 0);
      expect(selectors.length).to.equal(0);
    });

    it("GIVEN a resolver WHEN getting facet for zero ID THEN returns facet with zero address", async () => {
      const zeroId = "0x0000000000000000000000000000000000000000000000000000000000000000";
      const facet = await diamondLoupe.getFacet(zeroId);

      expect(facet.addr).to.equal("0x0000000000000000000000000000000000000000");
      expect(facet.selectors.length).to.equal(0);
    });

    it("GIVEN a resolver WHEN getting large page of facets THEN returns all available", async () => {
      const facetsLength = await diamondLoupe.getFacetsLength();
      const largePage = await diamondLoupe.getFacetsByPage(0, 10000);

      expect(largePage.length).to.equal(facetsLength.toNumber());
    });
  });
});
