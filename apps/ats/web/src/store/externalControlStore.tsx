// SPDX-License-Identifier: Apache-2.0

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface ExternalControlStore {
  address: string;
  type: "whitelist" | "blacklist";
}

interface ExternalControlStoreProps {
  externalControls: ExternalControlStore[];
  addExternalControl: (externalControl: ExternalControlStore) => void;
  removeExternalControl: (externalControlAddress: string) => void;
  reset: () => void;
}

const EXTERNAL_CONTROL_STORE_KEY = "EXTERNAL_CONTROL_STORE_KEY";

export const useExternalControlStore = create<ExternalControlStoreProps>()(
  persist(
    devtools((set) => ({
      externalControls: [],
      addExternalControl: (externalControl) =>
        set((state) => ({
          externalControls: [...state.externalControls, externalControl],
        })),
      removeExternalControl: (externalControlAddress) =>
        set((state) => ({
          externalControls: [...state.externalControls.filter((control) => control.address !== externalControlAddress)],
        })),
      reset: () =>
        set((state) => ({
          ...state,
          externalControls: [],
        })),
    })),
    {
      name: EXTERNAL_CONTROL_STORE_KEY,
    },
  ),
);
