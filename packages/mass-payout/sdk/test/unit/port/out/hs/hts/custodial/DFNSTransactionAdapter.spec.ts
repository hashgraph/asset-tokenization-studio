// SPDX-License-Identifier: Apache-2.0

import { DFNSTransactionAdapter } from "@port/out/hs/hts/custodial/DFNSTransactionAdapter";
import { CustodialWalletService, DFNSConfig } from "@hashgraph/hedera-custodians-integration";
import { WalletEvents } from "@app/services/event/WalletEvent";
import { SupportedWallets } from "@domain/network/Wallet";
import EventService from "@app/services/event/EventService";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import NetworkService from "@app/services/network/NetworkService";
import DfnsSettings from "@core/settings/custodialWalletSettings/DfnsSettings";

jest.mock("@hashgraph/hedera-custodians-integration", () => {
  return {
    CustodialWalletService: jest.fn().mockImplementation(() => ({
      signTransaction: jest.fn(),
    })),
    DFNSConfig: jest.fn(),
  };
});

describe("DFNSTransactionAdapter", () => {
  let mockEventService: jest.Mocked<EventService>;
  let mockMirrorNodeAdapter: jest.Mocked<MirrorNodeAdapter>;
  let mockNetworkService: jest.Mocked<NetworkService>;
  let adapter: DFNSTransactionAdapter;

  beforeEach(() => {
    mockEventService = { emit: jest.fn() } as any;
    mockMirrorNodeAdapter = {} as any;
    mockNetworkService = { environment: "testnet" } as any;

    adapter = new DFNSTransactionAdapter(mockEventService, mockMirrorNodeAdapter, mockNetworkService);
    jest.clearAllMocks();
  });

  it("should emit walletInit event and return environment on init", async () => {
    const result = await adapter.init();

    expect(mockEventService.emit).toHaveBeenCalledWith(WalletEvents.walletInit, {
      wallet: SupportedWallets.DFNS,
      initData: {},
    });
    expect(result).toBe("testnet");
  });

  it("should initialize custodialWalletService with DFNSConfig", () => {
    const settings: DfnsSettings = {
      serviceAccountSecretKey: "secret",
      serviceAccountCredentialId: "cred",
      serviceAccountAuthToken: "token",
      appOrigin: "origin",
      appId: "app",
      baseUrl: "url",
      walletId: "wallet",
      publicKey: "pubkey",
      hederaAccountId: "0.0.123",
    };

    adapter.initCustodialWalletService(settings);

    expect(DFNSConfig).toHaveBeenCalledWith(
      settings.serviceAccountSecretKey,
      settings.serviceAccountCredentialId,
      settings.serviceAccountAuthToken,
      settings.appOrigin,
      settings.appId,
      settings.baseUrl,
      settings.walletId,
      settings.publicKey,
    );
    expect(CustodialWalletService).toHaveBeenCalled();
  });

  it("should return SupportedWallets.DFNS from getSupportedWallet", () => {
    expect(adapter.getSupportedWallet()).toBe(SupportedWallets.DFNS);
  });

  it("should close client, emit walletDisconnect and return true on stop", async () => {
    const closeMock = jest.fn();
    adapter["client"] = { close: closeMock } as any;

    const result = await adapter.stop();

    expect(closeMock).toHaveBeenCalled();
    expect(mockEventService.emit).toHaveBeenCalledWith(WalletEvents.walletDisconnect, {
      wallet: SupportedWallets.DFNS,
    });
    expect(result).toBe(true);
  });
});
