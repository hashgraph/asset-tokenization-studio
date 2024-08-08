import React from "react";
import { ModalFooter } from "@chakra-ui/modal";
import { Button } from "@Components/Interaction/Button";
import { usePopupContext } from "../context/PopupContext";
import type { PopUpProps } from "../types";

export type PopupFooterProps = Pick<
  PopUpProps,
  | "confirmText"
  | "cancelText"
  | "onCancel"
  | "onConfirm"
  | "confirmButtonProps"
  | "cancelButtonProps"
>;

export const PopupFooter = ({
  confirmText: okTextArg = "Ok",
  cancelText: cancelTextArg = "Cancel",
  onCancel: onCancelArg,
  onConfirm: onConfirmArg,
  cancelButtonProps: cancelButtonPropsArg,
  confirmButtonProps: confirmButtonPropsArg,
}: PopupFooterProps) => {
  const {
    footer,
    onCancel = onCancelArg,
    onConfirm = onConfirmArg,
    confirmText = okTextArg,
    cancelText = cancelTextArg,
    confirmButtonProps = confirmButtonPropsArg,
    cancelButtonProps = cancelButtonPropsArg,
    styles,
  } = usePopupContext();

  return (
    <ModalFooter sx={styles.footer}>
      {footer || (
        <>
          {onCancel && (
            <Button
              variant="secondary"
              aria-label="cancel-button"
              onClick={onCancel}
              size="md"
              {...cancelButtonProps}
            >
              {cancelText}
            </Button>
          )}

          {onConfirm && (
            <Button
              variant="primary"
              aria-label="ok-button"
              ml={5}
              size="md"
              onClick={onConfirm}
              tabIndex={1}
              {...confirmButtonProps}
            >
              {confirmText}
            </Button>
          )}
        </>
      )}
    </ModalFooter>
  );
};
