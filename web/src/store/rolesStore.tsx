import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { SecurityRole } from "../utils/SecurityRole";

interface RolesStore {
  roles: SecurityRole[];
  setRoles: (roles: SecurityRole[]) => void;
}

const ROLES_STORE_KEY = "ROLES_STORE_KEY";

export const useRolesStore = create<RolesStore>()(
  persist(
    devtools((set) => ({
      roles: [],
      setRoles: (roles: SecurityRole[]) => set({ roles }),
    })),
    {
      name: ROLES_STORE_KEY,
    },
  ),
);
