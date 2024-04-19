import { create } from "zustand";
import { MetamaskStatus } from "../utils/constants";
import type { InitializationData } from "@iob/securitytoken-sdk";
import { NetworkData } from "@iob/securitytoken-sdk";

type WalletStoreStatus =
  | MetamaskStatus.disconnected
  | MetamaskStatus.connected
  | MetamaskStatus.connecting
  | MetamaskStatus.uninstalled;

interface WalletStore {
  address: string;
  setAddress: (address: string) => void;
  connectionStatus: WalletStoreStatus;
  setConnectionStatus: (status: WalletStoreStatus) => void;
  reset: () => void;
  data: InitializationData | null;
  network: NetworkData | null;
  setPairedWallet: (data: InitializationData, network: NetworkData) => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  address: "",
  setAddress: (address: string) =>
    set((state: WalletStore) => ({
      ...state,
      address,
      connectionStatus: MetamaskStatus.connected,
    })),
  connectionStatus: MetamaskStatus.disconnected,
  setConnectionStatus: (status: WalletStoreStatus) =>
    set((state: WalletStore) => ({ ...state, connectionStatus: status })),
  reset: () =>
    set((state: WalletStore) => ({
      ...state,
      address: "",
      data: null,
      network: null,
      connectionStatus: MetamaskStatus.disconnected,
    })),
  data: null,
  network: null,
  setPairedWallet: (data: InitializationData, network: NetworkData) =>
    set((state: WalletStore) => ({
      ...state,
      data,
      network,
      address: data.account?.id.value,
      connectionStatus: MetamaskStatus.connected,
    })),
}));
