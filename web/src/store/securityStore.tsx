import type { SecurityViewModel } from "@iob/securitytoken-sdk";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface SecurityStore {
  name: string;
  symbol: string;
  isin: string;
  securityType?: string;
  address: string;
  type?: string;
  isFavorite?: boolean;
}

interface SecurityArrayStore {
  securities: SecurityStore[];
  addSecurity: (security: SecurityStore) => void;
  details: SecurityViewModel | null;
  setDetails: (details: SecurityViewModel | null) => void;
  reset: () => void;
}

const SECURITIES_STORE_KEY = "SECURITIES_STORE_KEY";

export const useSecurityStore = create<SecurityArrayStore>()(
  persist(
    devtools((set) => ({
      securities: [],
      addSecurity: (security) =>
        set((state) => ({ securities: [...state.securities, security] })),
      details: null,
      setDetails: (details) =>
        set((state) => ({
          ...state,
          details,
        })),
      reset: () =>
        set((state) => ({
          ...state,
          securities: [],
          details: null,
        })),
    })),
    {
      name: SECURITIES_STORE_KEY,
    },
  ),
);
