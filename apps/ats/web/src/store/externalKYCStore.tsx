// SPDX-License-Identifier: Apache-2.0

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface ExternalKYCStore {
  address: string;
}

interface ExternalKYCStoreProps {
  externalKYCs: ExternalKYCStore[];
  addExternalKYC: (externalKYC: ExternalKYCStore) => void;
  removeExternalKYC: (externalKYCAddress: string) => void;
  reset: () => void;
}

const EXTERNAL_KYC_STORE_KEY = "EXTERNAL_KYC_STORE_KEY";

export const useExternalKYCStore = create<ExternalKYCStoreProps>()(
  persist(
    devtools((set) => ({
      externalKYCs: [],
      addExternalKYC: (externalKYC) =>
        set((state) => ({
          externalKYCs: [...state.externalKYCs, externalKYC],
        })),
      removeExternalKYC: (externalKYCAddress) =>
        set((state) => ({
          externalKYCs: [...state.externalKYCs.filter((KYC) => KYC.address !== externalKYCAddress)],
        })),
      reset: () =>
        set((state) => ({
          ...state,
          externalKYCs: [],
        })),
    })),
    {
      name: EXTERNAL_KYC_STORE_KEY,
    },
  ),
);
