// SPDX-License-Identifier: Apache-2.0

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { User } from "../utils/constants";

type UserType = User.admin | User.general | User.holder;

interface UserStore {
  type: UserType;
  setType: (type: UserType) => void;
}

const USER_STORE_KEY = "USER_STORE_KEY";

export const useUserStore = create<UserStore>()(
  persist(
    devtools((set) => ({
      type: User.general,
      setType: (type: UserType) => set({ type }),
    })),
    {
      name: USER_STORE_KEY,
    },
  ),
);
