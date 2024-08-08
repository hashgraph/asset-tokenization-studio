import { useUserStore } from "../../../store/userStore";
import { User } from "../../../utils/constants";
import { AdminActionsButtons } from "./AdminActionsButtons";
import { HolderActionsButtons } from "./HolderActionsButtons";

export const ActionsButtons = () => {
  const { type } = useUserStore();

  return type === User.admin ? (
    <AdminActionsButtons />
  ) : (
    <HolderActionsButtons />
  );
};
