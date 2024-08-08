import React from "react";
import { Flex } from "@chakra-ui/react";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
import _merge from "lodash/merge";
import { PopUpText } from "./components";
import type { InputControllerProps } from "@/Components/Forms";
import { InputController } from "@/Components/Forms";
import { useForm } from "react-hook-form";
import { PopUp } from "./PopUp";
import type { PopUpProps } from "./types";

interface ConfirmationForm {
  confirmation: string;
}

export interface ConfirmationPopUpProps extends PopUpProps {
  confirmationText: string;
  placeholder?: string;
  errorMessage?: string;
  label?: string;
  inputProps?: Omit<InputControllerProps<ConfirmationForm>, "control" | "id">;
}

export const ConfirmationPopUp = ({
  confirmationText,
  onConfirm,
  placeholder = confirmationText,
  confirmButtonProps,
  inputProps,
  errorMessage = "",
  label = "",
  variant,
  title,
  description,
  isContentCentered,
  onCloseComplete,
  children,
  ...props
}: ConfirmationPopUpProps) => {
  const {
    control,
    formState: { isValid },
    watch,
    reset,
  } = useForm<ConfirmationForm>({
    mode: "onChange",
  });

  const styles = useChakraMultiStyleConfig("PopUp", {
    variant,
    isContentCentered,
  });

  const handleConfirm = () => {
    if (watch("confirmation") !== confirmationText) return;
    onConfirm?.();
  };

  const confirmButtonPropsWithDefault = _merge(
    {
      isDisabled: !isValid,
    },
    confirmButtonProps
  );

  const defaultInputProps = _merge(
    {
      rules: {
        required: true,
        validate: (value: string) => value === confirmationText || errorMessage,
      },
      label,
    },
    inputProps
  );

  return (
    <PopUp
      {...props}
      onConfirm={handleConfirm}
      confirmButtonProps={confirmButtonPropsWithDefault}
      isContentCentered={false}
      onCloseComplete={() => {
        reset();
        onCloseComplete?.();
      }}
    >
      {children || (
        <>
          {title && <PopUpText label={title} type="title" />}
          {description && <PopUpText label={description} type="description" />}
        </>
      )}
      <Flex sx={styles.inputContainer} w="full">
        <InputController
          control={control}
          id="confirmation"
          placeholder={placeholder}
          size="sm"
          {...defaultInputProps}
        />
      </Flex>
    </PopUp>
  );
};
