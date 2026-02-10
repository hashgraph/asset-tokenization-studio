// SPDX-License-Identifier: Apache-2.0

import { PopUp, PhosphorIcon, Weight } from "io-bricks-ui";
import { Warning, Info } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import type { Asset } from "@/services/AssetService";

interface PopupConfigurationsProps {
  asset: Asset;
  isPaused: boolean;
  isImportingCorporateActions: boolean;
  isOpen: boolean;
  isImportOpen: boolean;
  isMutationLoading: boolean;
  onClose: () => void;
  onImportClose: () => void;
  onConfirmPauseUnpause: () => void;
  onConfirmImport: () => void;
}

export const PopupConfigurations = ({
  asset,
  isPaused,
  isImportingCorporateActions,
  isOpen,
  isImportOpen,
  isMutationLoading,
  onClose,
  onImportClose,
  onConfirmPauseUnpause,
  onConfirmImport,
}: PopupConfigurationsProps) => {
  const { t } = useTranslation("assets");

  const popupConfig = isPaused
    ? {
        icon: <PhosphorIcon as={Info} size="md" weight={Weight.Light} />,
        title: t("detail.popup.unpause.title"),
        description: t("detail.popup.unpause.description"),
        confirmText: t("detail.popup.unpause.confirmText"),
        cancelText: t("detail.popup.unpause.cancelText"),
        variant: "info",
      }
    : {
        icon: <PhosphorIcon as={Warning} size="md" weight={Weight.Light} />,
        title: t("detail.popup.pause.title"),
        description: t("detail.popup.pause.description"),
        confirmText: t("detail.popup.pause.confirmText"),
        cancelText: t("detail.popup.pause.cancelText"),
        variant: "warning",
      };

  const importCorporateActionsPopupConfig = {
    icon: <PhosphorIcon as={Info} size="md" weight={Weight.Light} />,
    title: isImportingCorporateActions
      ? t("detail.popup.stopImportCorporateActions.title", {
          name: asset?.name,
        })
      : t("detail.popup.importCorporateActions.title", {
          name: asset?.name,
        }),
    description: isImportingCorporateActions
      ? t("detail.popup.stopImportCorporateActions.description")
      : t("detail.popup.importCorporateActions.description"),
    confirmText: isImportingCorporateActions
      ? t("detail.popup.stopImportCorporateActions.confirmText")
      : t("detail.popup.importCorporateActions.confirmText"),
    cancelText: isImportingCorporateActions
      ? t("detail.popup.stopImportCorporateActions.cancelText")
      : t("detail.popup.importCorporateActions.cancelText"),
    variant: "info",
  };

  return (
    <>
      <PopUp
        id="pauseUnpauseDistributions"
        isOpen={isOpen}
        onClose={onClose}
        icon={popupConfig.icon}
        title={popupConfig.title}
        description={popupConfig.description}
        confirmText={popupConfig.confirmText}
        onConfirm={onConfirmPauseUnpause}
        onCancel={onClose}
        cancelText={popupConfig.cancelText}
        variant={popupConfig.variant}
        confirmButtonProps={{
          isLoading: isMutationLoading,
        }}
      />
      <PopUp
        id="importCorporateActions"
        isOpen={isImportOpen}
        onClose={onImportClose}
        icon={importCorporateActionsPopupConfig.icon}
        title={importCorporateActionsPopupConfig.title}
        description={importCorporateActionsPopupConfig.description}
        confirmText={importCorporateActionsPopupConfig.confirmText}
        onConfirm={onConfirmImport}
        onCancel={onImportClose}
        cancelText={importCorporateActionsPopupConfig.cancelText}
        variant={importCorporateActionsPopupConfig.variant}
      />
    </>
  );
};
