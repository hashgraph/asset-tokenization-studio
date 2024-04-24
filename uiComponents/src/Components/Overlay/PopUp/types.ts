import type { ModalProps } from "@chakra-ui/modal";
import type { ButtonProps } from "@Components/Interaction/Button";

export interface PopUpProps extends Omit<ModalProps, "children"> {
  showOverlay?: boolean;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  confirmButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactElement;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  children?: ModalProps["children"];
  isContentCentered?: boolean;
}
