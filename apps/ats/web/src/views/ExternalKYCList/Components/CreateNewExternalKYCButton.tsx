// SPDX-License-Identifier: Apache-2.0

import { Button } from "io-bricks-ui";
import type { ButtonProps } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { useCreateExternalKYCMock } from "../../../hooks/mutations/useExternalKYC";
import { useExternalKYCStore } from "../../../store/externalKYCStore";

export const CreateNewExternalKYCButton = (props: ButtonProps) => {
  const { t: tHeader } = useTranslation("externalKYC", {
    keyPrefix: "list.header",
  });

  const { addExternalKYC } = useExternalKYCStore();

  const { mutateAsync: createExternalKYCMock, isLoading: isLoadingCreatingExternalKYCMock } =
    useCreateExternalKYCMock();

  const handleCreate = async () => {
    createExternalKYCMock().then((response) => {
      if (response) {
        addExternalKYC({
          address: response,
        });
      }
    });
  };

  return (
    <Button
      data-testid="create-external-kyc-list-button"
      size="md"
      onClick={handleCreate}
      isLoading={isLoadingCreatingExternalKYCMock}
      {...props}
    >
      {tHeader("createNewExternalKYC")}
    </Button>
  );
};
