// SPDX-License-Identifier: Apache-2.0

import { create } from "zustand";

interface LocationStore {
  locations: string[];
  setLocations: (location: string) => void;
}

export const useLocationStore = create<LocationStore>((set) => ({
  locations: [],
  setLocations: (location: string) =>
    set((state: LocationStore) => ({
      ...state,
      locations: [...state.locations, location],
    })),
}));
