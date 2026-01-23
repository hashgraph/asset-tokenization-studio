// SPDX-License-Identifier: Apache-2.0

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface ExternalPauseStore {
  address: string;
  isPaused: boolean;
}

interface ExternalPauseStoreProps {
  externalPauses: ExternalPauseStore[];
  addExternalPause: (externalPause: ExternalPauseStore) => void;
  removeExternalPause: (externalPauseAddress: string) => void;
  toggleExternalPause: (externalPauseAddress: string, newPaused: boolean) => void;
  reset: () => void;
}

const EXTERNAL_PAUSE_STORE_KEY = "EXTERNAL_PAUSE_STORE_KEY";

export const useExternalPauseStore = create<ExternalPauseStoreProps>()(
  persist(
    devtools((set) => ({
      externalPauses: [],
      addExternalPause: (externalPause) =>
        set((state) => ({
          externalPauses: [...state.externalPauses, externalPause],
        })),
      removeExternalPause: (externalPauseAddress) =>
        set((state) => ({
          externalPauses: [...state.externalPauses.filter((pause) => pause.address !== externalPauseAddress)],
        })),
      toggleExternalPause: (externalPauseAddress, newPaused) =>
        set((state) => ({
          externalPauses: state.externalPauses.map((pause) =>
            pause.address === externalPauseAddress ? { ...pause, isPaused: newPaused } : pause,
          ),
        })),
      reset: () =>
        set((state) => ({
          ...state,
          externalPauses: [],
        })),
    })),
    {
      name: EXTERNAL_PAUSE_STORE_KEY,
    },
  ),
);
