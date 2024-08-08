import {
  useBoolean,
  useMultiStyleConfig as useChakraMultiStyleConfig,
} from "@chakra-ui/react";
import type { FieldValues } from "react-hook-form";
import type { InputProps } from "../../Input";
import type { InputControllerProps } from "../InputController/InputController";
import { InputController } from "../InputController/InputController";
import React from "react";
import { Button } from "@Components/Interaction/Button";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { PhosphorIcon } from "@/Components/Foundations";
import type { PartsStyleInterpolation } from "@/Theme/Components/BaseMultiStyleConfiguration";

export interface PasswordControllerProps<T extends FieldValues>
  extends Omit<InputProps, "id" | "defaultValue" | "onClear">,
    InputControllerProps<T> {
  iconShowPassword?: React.ReactElement;
  iconHidePassword?: React.ReactElement;
}

export const passwordControllerPartsList: Array<
  "iconShowPass" | "iconHidePass"
> = ["iconShowPass", "iconHidePass"];

type Parts = typeof passwordControllerPartsList;

export interface PasswordControllerThemeConfiguration {
  parts: Parts;
  baseStyle:
    | (({
        inputVariant,
      }: {
        inputVariant: string;
      }) => Partial<PasswordControllerThemeStyle>)
    | PartsStyleInterpolation<Parts>;
}

type PasswordControllerThemeStyle = Record<
  Parts[number],
  React.FunctionComponent
>;

export const PasswordController = <T extends FieldValues>({
  iconShowPassword,
  iconHidePassword,
  variant,
  ...props
}: PasswordControllerProps<T>) => {
  const [showPassword, setShowPassword] = useBoolean(false);
  const {
    iconShowPass: ThemeIconShowPass = () => <PhosphorIcon as={Eye} />,
    iconHidePass: ThemeIconHidePass = () => <PhosphorIcon as={EyeSlash} />,
  } = useChakraMultiStyleConfig("PasswordController", {
    inputVariant: variant,
  }) as PasswordControllerThemeStyle;

  const iconShowPass = iconShowPassword || <ThemeIconShowPass />;
  const iconHidePass = iconHidePassword || <ThemeIconHidePass />;

  return (
    <InputController
      {...props}
      variant={variant}
      addonRight={
        <Button
          pointerEvents="all"
          variant="ghost"
          m={0}
          p={0}
          minW={0}
          data-testid="toggle-password-visibility"
          onClick={setShowPassword.toggle}
          _hover={{ bg: "transparent" }}
          _active={{ bg: "transparent" }}
          aria-label={showPassword ? "Hide Password" : "Show Password"}
        >
          {showPassword ? iconHidePass : iconShowPass}
        </Button>
      }
      type={showPassword ? "text" : "password"}
    />
  );
};
