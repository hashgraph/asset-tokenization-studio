import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface AccountData {
  address: string;
  isFavorite: boolean;
}

interface AccountStore {
  [key: string]: AccountData[];
}

interface AccountArrayStore {
  adminSecurities: AccountStore;
  holderSecurities: AccountStore;
  addSecurityToAdmin: (key: string, account: AccountData) => void;
  addSecurityToHolder: (key: string, account: AccountData) => void;
  removeSecurityFromHolder: (
    walletAddress: string,
    securityAddress: string,
  ) => void;
  toggleAdminFavorite: (walletAddress: string, securityAddress: string) => void;
  toggleHolderFavorite: (
    walletAddress: string,
    securityAddress: string,
  ) => void;
  isResetted: boolean;
  reset: () => void;
}

const ACCOUNT_STORE_KEY = "ACCOUNT_STORE_KEY";

const toggleFavorite = (
  state: AccountArrayStore,
  key: "adminSecurities" | "holderSecurities",
  walletAddress: string,
  securityAddress: string,
) => {
  const securities = state[key];

  const securityIndex = securities[walletAddress].findIndex(
    (security) => security.address === securityAddress,
  );
  securities[walletAddress][securityIndex].isFavorite =
    !securities[walletAddress][securityIndex].isFavorite;

  return {
    ...state,
    [key]: { ...securities },
  };
};

export const useAccountStore = create<AccountArrayStore>()(
  persist(
    devtools((set) => ({
      adminSecurities: {},
      holderSecurities: {},
      addSecurityToAdmin: (key, account) =>
        set((state) => ({
          adminSecurities: {
            ...state.adminSecurities,
            [key]: [...(state.adminSecurities[key] || []), account],
          },
        })),
      addSecurityToHolder: (key, account) =>
        set((state) => ({
          holderSecurities: {
            ...state.holderSecurities,
            [key]: [...(state.holderSecurities[key] || []), account],
          },
        })),
      removeSecurityFromHolder: (walletAddress, securityAddress) =>
        set((state) => {
          const { holderSecurities } = state;
          const securityIndex = holderSecurities[walletAddress].findIndex(
            (security) => security.address === securityAddress,
          );

          holderSecurities[walletAddress].splice(securityIndex, 1);

          return {
            ...state,
            holderSecurities: {
              ...holderSecurities,
              [walletAddress]: [...holderSecurities[walletAddress]],
            },
          };
        }),
      toggleAdminFavorite: (walletAddress, securityAddress) =>
        set((state) =>
          toggleFavorite(
            state,
            "adminSecurities",
            walletAddress,
            securityAddress,
          ),
        ),
      toggleHolderFavorite: (walletAddress, securityAddress) =>
        set((state) =>
          toggleFavorite(
            state,
            "holderSecurities",
            walletAddress,
            securityAddress,
          ),
        ),
      isResetted: false,
      reset: () =>
        set((state) => ({
          ...state,
          adminSecurities: {},
          holderSecurities: {},
          isResetted: true,
        })),
    })),
    {
      name: ACCOUNT_STORE_KEY,
    },
  ),
);
