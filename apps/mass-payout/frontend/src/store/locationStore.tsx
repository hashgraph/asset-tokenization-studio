// SPDX-License-Identifier: Apache-2.0

import { create } from "zustand";

interface LocationStore {
  locations: string[];
  setLocations: (location: string) => void;
  getCurrentUrl: () => string;
  shouldNavigateToAssets: () => boolean;
  shouldReplaceGobackRoute: () => boolean;
  getGoBackPath: (fallbackPath?: string) => string;
  getGoBackAction: () => "navigate-to-assets" | "navigate-to-landing" | "navigate-back";
}

export const useLocationStore = create<LocationStore>((set, get) => ({
  locations: [],
  setLocations: (location: string) =>
    set((state: LocationStore) => ({
      ...state,
      locations: [...state.locations, location],
    })),
  getCurrentUrl: () => {
    return window.location.href;
  },
  shouldNavigateToAssets: () => {
    const currentUrl = new URL(get().getCurrentUrl());
    const hasTabDistributions = currentUrl.searchParams.get("tab") === "distributions";
    return hasTabDistributions && currentUrl.pathname.includes("/assets/");
  },
  shouldReplaceGobackRoute: () => {
    const { locations } = get();
    return locations[locations.length - 2]?.includes("/create") || locations[locations.length - 2]?.includes("/add");
  },
  getGoBackPath: (fallbackPath?: string) => {
    const { shouldNavigateToAssets, shouldReplaceGobackRoute } = get();
    if (shouldNavigateToAssets()) return "/assets";
    if (shouldReplaceGobackRoute()) return "/";
    return fallbackPath || "/";
  },
  getGoBackAction: () => {
    const { shouldNavigateToAssets, shouldReplaceGobackRoute } = get();
    if (shouldNavigateToAssets()) {
      return "navigate-to-assets";
    }
    if (shouldReplaceGobackRoute()) {
      return "navigate-to-landing";
    }
    return "navigate-back";
  },
}));
