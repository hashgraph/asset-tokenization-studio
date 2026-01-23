// SPDX-License-Identifier: Apache-2.0

import { create } from "zustand";
import { WalletStatus } from "../utils/constants";
import type { InitializationData } from "@hashgraph/asset-tokenization-sdk";
import { NetworkData } from "@hashgraph/asset-tokenization-sdk";

type WalletStoreStatus =
  | WalletStatus.disconnected
  | WalletStatus.connected
  | WalletStatus.connecting
  | WalletStatus.uninstalled;

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
      connectionStatus: WalletStatus.connected,
    })),
  connectionStatus: WalletStatus.disconnected,
  setConnectionStatus: (status: WalletStoreStatus) =>
    set((state: WalletStore) => ({ ...state, connectionStatus: status })),
  reset: () =>
    set((state: WalletStore) => ({
      ...state,
      address: "",
      data: null,
      network: null,
      connectionStatus: WalletStatus.disconnected,
    })),
  data: null,
  network: null,
  setPairedWallet: (data: InitializationData, network: NetworkData) =>
    set((state: WalletStore) => ({
      ...state,
      data,
      network,
      address: data.account?.id.value,
      connectionStatus: WalletStatus.connected,
    })),
}));
