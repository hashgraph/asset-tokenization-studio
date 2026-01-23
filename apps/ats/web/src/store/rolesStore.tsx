// SPDX-License-Identifier: Apache-2.0

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface RolesStore {
  roles: string[];
  setRoles: (roles: string[]) => void;
}

const ROLES_STORE_KEY = "ROLES_STORE_KEY";

export const useRolesStore = create<RolesStore>()(
  persist(
    devtools((set) => ({
      roles: [],
      setRoles: (roles: string[]) => set({ roles }),
    })),
    {
      name: ROLES_STORE_KEY,
    },
  ),
);
