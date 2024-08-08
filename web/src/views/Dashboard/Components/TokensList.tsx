import { Stack } from "@chakra-ui/react";
import { FavoritesList } from "./FavoritesList";
import { User } from "../../../utils/constants";

export const TokensList = () => {
  return (
    <Stack gap={6}>
      <FavoritesList type={User.admin} />
      <FavoritesList type={User.holder} />
    </Stack>
  );
};
