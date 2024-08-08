import React from "react";
import * as ChakraModal from "@chakra-ui/modal";
import { Flex as ChakraFlex } from "@chakra-ui/react";
import type { SystemStyleObject as ChakraSystemStyleObject } from "@chakra-ui/system";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
import type { BaseMultiStyleConfiguration } from "@/Theme/Components/BaseMultiStyleConfiguration";
import { CloseButton } from "@Components/Interaction/CloseButton";
import type { PopUpProps } from "./types";
import { PopupFooter } from "./components";
import { DefaultPopup } from "./DefaultPopup";
import { PopupContext } from "./context/PopupContext";

export const popUpPartsList: (
  | "overlay"
  | "container"
  | "dialog"
  | "header"
  | "closeButton"
  | "body"
  | "footer"
  | "icon"
  | "title"
  | "description"
  | "contentContainer"
  | "inputContainer"
)[] = [
  "body",
  "overlay",
  "footer",
  "header",
  "container",
  "icon",
  "title",
  "description",
  "contentContainer",
  "inputContainer",
];

type Parts = typeof popUpPartsList;

export interface PopUpThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {}

export type PopupThemeStyle = Record<Parts[number], ChakraSystemStyleObject>;

export const PopUp = ({
  showOverlay = true,
  showCloseButton = true,
  footer,
  onCancel,
  onConfirm,
  confirmText,
  cancelText,
  variant,
  title,
  description,
  icon,
  confirmButtonProps,
  cancelButtonProps,
  isContentCentered = true,
  ...props
}: PopUpProps) => {
  const styles = useChakraMultiStyleConfig("PopUp", {
    variant,
    isContentCentered,
    size: props.size,
  }) as PopupThemeStyle;

  return (
    <PopupContext.Provider
      value={{
        footer,
        onCancel,
        onConfirm,
        confirmText,
        cancelText,
        variant,
        title,
        description,
        icon,
        cancelButtonProps,
        confirmButtonProps,
        styles,
      }}
    >
      <ChakraModal.Modal isCentered {...props}>
        {showOverlay && (
          <ChakraModal.ModalOverlay
            data-testid="popup-overlay"
            sx={styles.overlay}
          />
        )}
        <ChakraModal.ModalContent sx={styles.container}>
          {showCloseButton && (
            <CloseButton
              alignSelf="flex-end"
              tabIndex={0}
              sx={styles.closeButton}
              onClick={props.onClose}
            />
          )}

          <ChakraModal.ModalBody sx={styles.body}>
            <ChakraFlex sx={styles.contentContainer}>
              {props.children || <DefaultPopup />}
            </ChakraFlex>
          </ChakraModal.ModalBody>
          <PopupFooter />
        </ChakraModal.ModalContent>
      </ChakraModal.Modal>
    </PopupContext.Provider>
  );
};
