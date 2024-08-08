import type { PasswordControllerThemeConfiguration } from "@Components/Forms/Controllers";
import { Icon } from "@/Components/Foundations/Icon";
import React from "react";
import { Eye, EyeClosed } from "@phosphor-icons/react";

export const ConfigPasswordController: PasswordControllerThemeConfiguration = {
  parts: ["iconShowPass", "iconHidePass"],
  baseStyle: ({ inputVariant }) => {
    return {
      iconShowPass: () => {
        return <Icon as={Eye} color="neutral.500" />;
      },
      iconHidePass: () => {
        return <Icon as={EyeClosed} color="neutral.700" />;
      },
    };
  },
};
