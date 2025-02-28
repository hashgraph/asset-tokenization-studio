import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import SDKService from "../../services/SDKService";
import { useTranslation } from "react-i18next";
import { useToast } from "io-bricks-ui";
import { GET_CLEARING_OPERATIONS_LIST } from "../queries/useClearingOperations";

export const useCreateClearingTransferByPartition = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.clearingOperations.messages",
  });

  return useMutation(
    (req: unknown) => SDKService.clearingTransferByPartition(req),
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries({
          queryKey: [
            GET_CLEARING_OPERATIONS_LIST(
              variables.securityId,
              variables.targetId,
            ),
          ],
        });

        console.log(
          "SDK message --> Clearing Operation operation success: ",
          data,
        );

        if (!data) {
          return;
        }

        toast.show({
          duration: 3000,
          title: t("success"),
          description: t("descriptionSuccess"),
          variant: "subtle",
          status: "success",
        });
      },
      onError: (error) => {
        console.log(
          "SDK message --> Clearing Operation operation error: ",
          error,
        );

        toast.show({
          duration: 3000,
          title: t("error"),
          description: t("descriptionFailed"),
          variant: "subtle",
          status: "error",
        });
      },
    },
  );
};

export const useCreateClearingRedeemByPartition = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.clearingOperations.messages",
  });

  return useMutation(
    (req: unknown) => SDKService.clearingRedeemByPartition(req),
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries({
          queryKey: [
            GET_CLEARING_OPERATIONS_LIST(
              variables.securityId,
              variables.targetId,
            ),
          ],
        });

        console.log(
          "SDK message --> Clearing Operation operation success: ",
          data,
        );

        if (!data) {
          return;
        }

        toast.show({
          duration: 3000,
          title: t("success"),
          description: t("descriptionSuccess"),
          variant: "subtle",
          status: "success",
        });
      },
      onError: (error) => {
        console.log(
          "SDK message --> Clearing Operation operation error: ",
          error,
        );

        toast.show({
          duration: 3000,
          title: t("error"),
          description: t("descriptionFailed"),
          variant: "subtle",
          status: "error",
        });
      },
    },
  );
};

export const useCreateClearingHoldByPartition = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.clearingOperations.messages",
  });

  return useMutation(
    (req: unknown) => SDKService.clearingCreateHoldByPartition(req),
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries({
          queryKey: [
            GET_CLEARING_OPERATIONS_LIST(
              variables.securityId,
              variables.targetId,
            ),
          ],
        });

        console.log(
          "SDK message --> Clearing Operation operation success: ",
          data,
        );

        if (!data) {
          return;
        }

        toast.show({
          duration: 3000,
          title: t("success"),
          description: t("descriptionSuccess"),
          variant: "subtle",
          status: "success",
        });
      },
      onError: (error) => {
        console.log(
          "SDK message --> Clearing Operation operation error: ",
          error,
        );

        toast.show({
          duration: 3000,
          title: t("error"),
          description: t("descriptionFailed"),
          variant: "subtle",
          status: "error",
        });
      },
    },
  );
};

export const useApproveClearingByPartition = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.clearingOperations.messages",
  });

  return useMutation(
    (req: unknown) => SDKService.approveClearingOperationByPartition(req),
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries({
          queryKey: [
            GET_CLEARING_OPERATIONS_LIST(
              variables.securityId,
              variables.targetId,
            ),
          ],
        });

        console.log(
          "SDK message --> Clearing Operation operation success: ",
          data,
        );

        if (!data) {
          return;
        }

        toast.show({
          duration: 3000,
          title: t("success"),
          description: t("descriptionSuccess"),
          variant: "subtle",
          status: "success",
        });
      },
      onError: (error) => {
        console.log(
          "SDK message --> Clearing Operation operation error: ",
          error,
        );

        toast.show({
          duration: 3000,
          title: t("error"),
          description: t("descriptionFailed"),
          variant: "subtle",
          status: "error",
        });
      },
    },
  );
};

export const useCancelClearingByPartition = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.clearingOperations.messages",
  });

  return useMutation(
    (req: unknown) => SDKService.cancelClearingOperationByPartition(req),
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries({
          queryKey: [
            GET_CLEARING_OPERATIONS_LIST(
              variables.securityId,
              variables.targetId,
            ),
          ],
        });

        console.log(
          "SDK message --> Clearing Operation operation success: ",
          data,
        );

        if (!data) {
          return;
        }

        toast.show({
          duration: 3000,
          title: t("success"),
          description: t("descriptionSuccess"),
          variant: "subtle",
          status: "success",
        });
      },
      onError: (error) => {
        console.log(
          "SDK message --> Clearing Operation operation error: ",
          error,
        );

        toast.show({
          duration: 3000,
          title: t("error"),
          description: t("descriptionFailed"),
          variant: "subtle",
          status: "error",
        });
      },
    },
  );
};

export const useReclaimClearingByPartition = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.clearingOperations.messages",
  });

  return useMutation(
    (req: unknown) => SDKService.reclaimClearingOperationByPartition(req),
    {
      onSuccess(data, variables) {
        queryClient.invalidateQueries({
          queryKey: [
            GET_CLEARING_OPERATIONS_LIST(
              variables.securityId,
              variables.targetId,
            ),
          ],
        });

        console.log(
          "SDK message --> Clearing Operation operation success: ",
          data,
        );

        if (!data) {
          return;
        }

        toast.show({
          duration: 3000,
          title: t("success"),
          description: t("descriptionSuccess"),
          variant: "subtle",
          status: "success",
        });
      },
      onError: (error) => {
        console.log(
          "SDK message --> Clearing Operation operation error: ",
          error,
        );

        toast.show({
          duration: 3000,
          title: t("error"),
          description: t("descriptionFailed"),
          variant: "subtle",
          status: "error",
        });
      },
    },
  );
};

export const useActivateClearing = (
  options: UseMutationOptions<boolean, unknown, unknown, unknown> = {},
) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.clearingOperations.messages",
  });

  return useMutation((req: unknown) => SDKService.activateClearing(req), {
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: [
          GET_CLEARING_OPERATIONS_LIST(
            variables.securityId,
            variables.targetId,
          ),
        ],
      });

      console.log(
        "SDK message --> Clearing Operation operation success: ",
        data,
      );

      if (!data) {
        return;
      }

      toast.show({
        duration: 3000,
        title: t("success"),
        description: t("descriptionSuccess"),
        variant: "subtle",
        status: "success",
      });
    },
    onError: (error) => {
      console.log(
        "SDK message --> Clearing Operation operation error: ",
        error,
      );

      toast.show({
        duration: 3000,
        title: t("error"),
        description: t("descriptionFailed"),
        variant: "subtle",
        status: "error",
      });
    },
    ...options,
  });
};

export const useDeactivateClearing = (
  options: UseMutationOptions<boolean, unknown, unknown, unknown> = {},
) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation("security", {
    keyPrefix: "details.clearingOperations.messages",
  });

  return useMutation((req: unknown) => SDKService.deactivateClearing(req), {
    onSuccess(data, variables) {
      queryClient.invalidateQueries({
        queryKey: [
          GET_CLEARING_OPERATIONS_LIST(
            variables.securityId,
            variables.targetId,
          ),
        ],
      });

      console.log(
        "SDK message --> Clearing Operation operation success: ",
        data,
      );

      if (!data) {
        return;
      }

      toast.show({
        duration: 3000,
        title: t("success"),
        description: t("descriptionSuccess"),
        variant: "subtle",
        status: "success",
      });
    },
    onError: (error) => {
      console.log(
        "SDK message --> Clearing Operation operation error: ",
        error,
      );

      toast.show({
        duration: 3000,
        title: t("error"),
        description: t("descriptionFailed"),
        variant: "subtle",
        status: "error",
      });
    },
    ...options,
  });
};
