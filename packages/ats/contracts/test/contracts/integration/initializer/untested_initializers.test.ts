import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers.js";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import {
  RESOLVER_KEY_PROCEED_RECIPIENTS_KPI_LINKED_RATE,
  RESOLVER_KEY_SCHEDULED_CROSS_ORDERED_TASKS_KPI_LINKED_RATE,
  RESOLVER_KEY_ERC20PERMIT,
  RESOLVER_KEY_IDENTITY,
  RESOLVER_KEY_KYC,
  RESOLVER_KEY_CONTROL_LIST,
  RESOLVER_KEY_DEACTIVATE,
  RESOLVER_KEY_SNAPSHOTS,
  RESOLVER_KEY_BALANCE_TRACKER,
  RESOLVER_KEY_SSI_MANAGEMENT,
  RESOLVER_KEY_PROCEED_RECIPIENTS,
  RESOLVER_KEY_SCHEDULED_TASKS,
  ATS_ROLES,
} from "@scripts";
import { deployAtsInfrastructureFixture, deployEquityTokenFixture } from "@test";

// TODO: Tactical solution to cover some initializers uncovered
describe("Integration — Untested Initializers", () => {
  let _admin: HardhatEthersSigner;
  let nonAdmin: HardhatEthersSigner;

  before(async () => {
    [_admin, nonAdmin] = await ethers.getSigners();
  });

  const testInitializers = [
    {
      name: "ProceedRecipientsKpiLinkedRate",
      key: RESOLVER_KEY_PROCEED_RECIPIENTS_KPI_LINKED_RATE,
      method: "initializeProceedRecipients",
      event: "ProceedRecipientsInitialized",
      preInitialized: true, // Registered in default equity config
      params: [[], []],
      expectedKeyOnFailure: RESOLVER_KEY_PROCEED_RECIPIENTS, // Base ProceedRecipients key
    },
    {
      name: "ScheduledCrossOrderedTasksKpiLinkedRate",
      key: RESOLVER_KEY_SCHEDULED_CROSS_ORDERED_TASKS_KPI_LINKED_RATE,
      method: "initializeScheduledCrossOrderedTasks",
      event: "ScheduledCrossOrderedTasksInitialized",
      preInitialized: true, // Registered in default equity config
      params: [],
      expectedKeyOnFailure: RESOLVER_KEY_SCHEDULED_TASKS, // Base ScheduledCrossOrderedTasks key
    },
    {
      name: "ERC20Permit",
      key: RESOLVER_KEY_ERC20PERMIT,
      method: "initializeERC20Permit",
      event: "ERC20PermitInitialized",
      preInitialized: true,
      params: [],
    },
    {
      name: "Identity",
      key: RESOLVER_KEY_IDENTITY,
      method: "initializeIdentity",
      event: "IdentityInitialized",
      preInitialized: true,
      params: [ethers.ZeroAddress],
    },
    {
      name: "Kyc",
      key: RESOLVER_KEY_KYC,
      method: "initializeInternalKyc",
      event: "KycInitialized",
      preInitialized: true,
      params: [true],
    },
    {
      name: "ControlList",
      key: RESOLVER_KEY_CONTROL_LIST,
      method: "initializeControlList",
      event: "ControlListInitialized",
      preInitialized: true,
      params: [true],
    },
    {
      name: "Deactivate",
      key: RESOLVER_KEY_DEACTIVATE,
      method: "initializeDeactivate",
      event: "DeactivateInitialized",
      preInitialized: true,
      params: [],
    },
    {
      name: "Snapshots",
      key: RESOLVER_KEY_SNAPSHOTS,
      method: "initializeSnapshots",
      event: "SnapshotsInitialized",
      preInitialized: true,
      params: [],
    },
    {
      name: "BalanceTracker",
      key: RESOLVER_KEY_BALANCE_TRACKER,
      method: "initializeBalanceTracker",
      event: "BalanceTrackerInitialized",
      preInitialized: true,
      params: [],
    },
    {
      name: "SsiManagement",
      key: RESOLVER_KEY_SSI_MANAGEMENT,
      method: "initializeSsiManagement",
      event: "SsiManagementInitialized",
      preInitialized: true,
      params: [],
    },
  ];

  testInitializers.forEach((facet) => {
    describe(`GIVEN ${facet.name} facet`, () => {
      async function setupTokenFixture() {
        const infra = await deployAtsInfrastructureFixture();
        const { asset } = await deployEquityTokenFixture({ infrastructure: infra });
        return { asset, infra };
      }

      it(`WHEN non-admin calls ${facet.method} THEN it reverts with AccountHasNoRole`, async () => {
        const { asset } = await loadFixture(setupTokenFixture);
        const assetAsNonAdmin = asset.connect(nonAdmin);

        await expect(assetAsNonAdmin[facet.method](...facet.params))
          .to.be.revertedWithCustomError(asset, "AccountHasNoRole")
          .withArgs(nonAdmin.address, ATS_ROLES.DEFAULT_ADMIN_ROLE);
      });

      if (!facet.preInitialized) {
        it(`WHEN admin calls ${facet.method} THEN it emits ${facet.event} and succeeds`, async () => {
          const { asset, infra } = await loadFixture(setupTokenFixture);
          const assetAsAdmin = asset.connect(infra.deployer);

          await expect(assetAsAdmin[facet.method](...facet.params)).to.emit(asset, facet.event);
        });
      } else {
        it(`SKIPPED: ${facet.method} is already initialized during deployment`, async () => {
          // No-op, just documenting it's pre-initialized
        });
      }

      it(`WHEN calling ${facet.method} THEN it reverts with FacetAlreadyRegistered (if admin) or AccountHasNoRole (if not)`, async () => {
        const { asset, infra } = await loadFixture(setupTokenFixture);
        const assetAsAdmin = asset.connect(infra.deployer);

        if (!facet.preInitialized) {
          await assetAsAdmin[facet.method](...facet.params);
        }

        await expect(assetAsAdmin[facet.method](...facet.params))
          .to.be.revertedWithCustomError(asset, "FacetAlreadyRegistered")
          .withArgs(facet.expectedKeyOnFailure ?? facet.key, 1);
      });
    });
  });
});
