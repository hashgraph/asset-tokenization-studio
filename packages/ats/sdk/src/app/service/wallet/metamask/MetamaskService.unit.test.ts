// SPDX-License-Identifier: Apache-2.0

import MetamaskService from "./MetamaskService";
import { CommandBus } from "@core/command/CommandBus";
import EventService from "@service/event/EventService";
import NetworkService from "@service/network/NetworkService";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import { WalletEvents, ConnectionState } from "@service/event/WalletEvent";
import { SupportedWallets } from "@domain/context/network/Wallet";
import { ethers } from "ethers";
import { createMock } from "@golevelup/ts-jest";
import { HederaId } from "@domain/context/shared/HederaId";
import Account from "@domain/context/account/Account";
import { AccountPropsFixture } from "@test/fixtures/account/AccountFixture";
import { EvmAddressPropsFixture, HederaIdPropsFixture } from "@test/fixtures/shared/DataFixture";

describe("MetamaskService", () => {
  let metamaskService: MetamaskService;
  const mockEventService = createMock<EventService>();
  const mockCommandBus = createMock<CommandBus>();
  const mockNetworkService = createMock<NetworkService>();
  const mockMirrorNodeAdapter = createMock<MirrorNodeAdapter>();
  let mockEthereum: any;
  const account = new Account(AccountPropsFixture.create());
  const id = new HederaId(HederaIdPropsFixture.create().value);
  const evmAddress = EvmAddressPropsFixture.create().value;

  beforeEach(() => {
    metamaskService = new MetamaskService(mockEventService, mockCommandBus, mockNetworkService, mockMirrorNodeAdapter);

    mockEthereum = {
      isMetaMask: true,
      isConnected: jest.fn().mockReturnValue(true),
      request: jest.fn(),
      on: jest.fn(),
    };
    (global as any).ethereum = mockEthereum;

    const mockSigner = { getAddress: jest.fn().mockResolvedValue(evmAddress) };
    jest.spyOn(ethers.providers, "Web3Provider").mockImplementation(
      () =>
        ({
          getSigner: jest.fn().mockReturnValue(mockSigner),
        }) as any,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("init", () => {
    it("should not call connectMetamask when debug is true", async () => {
      await metamaskService.init(true);

      expect(mockEventService.emit).toHaveBeenCalledWith(WalletEvents.walletInit, expect.any(Object));
    });
  });

  describe("register", () => {
    it("should register account and handler", async () => {
      const mockHandler = {} as any;
      mockMirrorNodeAdapter.getAccountInfo.mockResolvedValue({
        id: id,
        evmAddress: evmAddress,
      });

      const result = await metamaskService.register(mockHandler, account, true);

      expect(result).toEqual({ account: account });
      expect(mockMirrorNodeAdapter.getAccountInfo).toHaveBeenCalledWith({
        value: account.id.value,
      });
    });
  });

  describe("stop", () => {
    it("should emit disconnect events and return true", async () => {
      const result = await metamaskService.stop();

      expect(result).toBe(true);
      expect(mockEventService.emit).toHaveBeenCalledWith(WalletEvents.walletConnectionStatusChanged, {
        status: ConnectionState.Disconnected,
        wallet: SupportedWallets.METAMASK,
      });
      expect(mockEventService.emit).toHaveBeenCalledWith(WalletEvents.walletDisconnect, {
        wallet: SupportedWallets.METAMASK,
      });
    });
  });

  describe("setConfig", () => {
    it("should set configuration properties", () => {
      const config = {
        mirrorNodes: { nodes: [] },
        jsonRpcRelays: { nodes: [] },
        factories: { factories: [] },
        resolvers: { resolvers: [] },
      };

      metamaskService.setConfig(config);

      expect(metamaskService["mirrorNodes"]).toBe(config.mirrorNodes);
      expect(metamaskService["jsonRpcRelays"]).toBe(config.jsonRpcRelays);
      expect(metamaskService["factories"]).toBe(config.factories);
      expect(metamaskService["resolvers"]).toBe(config.resolvers);
    });
  });
});
