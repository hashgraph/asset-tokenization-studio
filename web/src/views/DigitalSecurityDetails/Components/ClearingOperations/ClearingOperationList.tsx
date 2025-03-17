import { Center, Stack, useDisclosure, VStack } from "@chakra-ui/react";
import {
  Button,
  DefinitionList,
  Heading,
  PhosphorIcon,
  PopUp,
  useToast,
} from "io-bricks-ui";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { WarningCircle } from "@phosphor-icons/react";
import { useState } from "react";
import {
  DATE_TIME_FORMAT,
  DEFAULT_PARTITION,
} from "../../../../utils/constants";
import { formatDate } from "../../../../utils/format";
import { useSecurityStore } from "../../../../store/securityStore";
import {
  ClearingOperationViewModel,
  GET_CLEARING_OPERATIONS_LIST,
  useGetClearingOperations,
} from "../../../../hooks/queries/useClearingOperations";
import { ReclaimClearingOperationByPartitionRequest } from "@hashgraph/asset-tokenization-sdk";
import { useWalletStore } from "../../../../store/walletStore";
import { useReclaimClearingByPartition } from "../../../../hooks/mutations/useClearingOperations";
import { useQueryClient } from "@tanstack/react-query";

const ClearingOperationTypeText: Record<number, string> = {
  0: "Transfer",
  1: "Redeem",
  2: "Hold Creation",
};

export const ClearingOperationsList = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { isOpen, onClose, onOpen } = useDisclosure();

  const { id: securityId = "" } = useParams();

  const { details } = useSecurityStore();
  const { address } = useWalletStore();
  const [_isMutating, setIsMutating] = useState(false);
  const [clearOperationSelected, setClearOperationSelected] =
    useState<ClearingOperationViewModel>();
  const [isReclaiming, setIsReclaiming] = useState(false);

  const { t: tList } = useTranslation("security", {
    keyPrefix: "details.clearingOperations.list",
  });
  const { t: tActions } = useTranslation("security", {
    keyPrefix: "details.clearingOperations.actions.confirmReclaimPopUp",
  });
  const { t: tMessages } = useTranslation("security", {
    keyPrefix: "details.clearingOperations.messages",
  });

  const { mutate } = useReclaimClearingByPartition();

  const onSubmit = () => {
    setIsMutating(true);

    const request = new ReclaimClearingOperationByPartitionRequest({
      clearingId: Number(clearOperationSelected?.id),
      clearingOperationType: Number(clearOperationSelected?.operationType),
      partitionId: DEFAULT_PARTITION,
      securityId,
      targetId: address,
    });

    mutate(request, {
      onSettled() {
        setIsMutating(false);
      },
      onSuccess(_data, variables) {
        const queryKey = [GET_CLEARING_OPERATIONS_LIST(variables.securityId)];

        queryClient.setQueryData(
          queryKey,
          (oldData: ClearingOperationViewModel[] | undefined) => {
            if (!oldData) return [];
            return oldData.filter((op) => op.id !== variables.clearingId);
          },
        );

        toast.show({
          duration: 3000,
          title: tMessages("success"),
          description: tMessages("descriptionSuccess"),
          variant: "subtle",
          status: "success",
        });
      },
    });

    setIsMutating(false);
  };

  const request = {
    securityId,
    targetId: address,
    partitionId: DEFAULT_PARTITION,
    start: 0,
    end: 50,
  };

  const { data } = useGetClearingOperations(request);

  return (
    <Stack w="full" h="full" layerStyle="container">
      <PopUp
        id="confirm-clearing-operation-list-popup"
        isOpen={isOpen}
        onClose={onClose}
        icon={<PhosphorIcon as={WarningCircle} size="md" />}
        title={tActions("title")}
        description={tActions("description")}
        confirmText={tActions("confirmText")}
        cancelText={tActions("cancelText")}
        onConfirm={() => {
          setIsReclaiming(true);
          onSubmit();
          onClose();
        }}
        onCancel={() => {
          setIsReclaiming(false);
          onClose();
        }}
      />
      <Center h="full" bg="neutral.dark.600">
        <VStack align="flex-start" p={6} gap={4}>
          <VStack w={800} align="center" gap={4}>
            <Heading textStyle="HeadingMediumLG">{tList("title")}</Heading>
            <VStack gap={4} w={"full"}>
              {data?.map((op, index) => {
                const isExpirationDateResearch =
                  Number(op.expirationDate) < Date.now();

                const isReclaimable = isExpirationDateResearch;

                return (
                  <VStack
                    w={"full"}
                    key={index}
                    bgColor={"neutral.white"}
                    py={12}
                    position={"relative"}
                    px={20}
                  >
                    <DefinitionList
                      items={[
                        {
                          title: tList("id"),
                          description: op.id,
                        },
                        {
                          title: tList("clearingOperationType"),
                          description:
                            ClearingOperationTypeText[op.operationType],
                        },
                        {
                          title: tList("amount"),
                          description: op.amount + " " + details?.symbol,
                        },
                        {
                          title: tList("expirationDate"),
                          description: formatDate(
                            Number(op.expirationDate),
                            DATE_TIME_FORMAT,
                          ),
                        },
                        ...(op.destination
                          ? [
                              {
                                title: tList("targetId"),
                                description: op.destination,
                              },
                            ]
                          : []),
                        ...(op.holdExpirationDate
                          ? [
                              {
                                title: tList("holdExpirationDate"),
                                description: formatDate(
                                  Number(op.holdExpirationDate),
                                  DATE_TIME_FORMAT,
                                ),
                              },
                            ]
                          : []),
                        ...(op.holdEscrow
                          ? [
                              {
                                title: tList("escrowAddress"),
                                description: op.holdEscrow,
                              },
                            ]
                          : []),
                      ]}
                    />
                    {isReclaimable && (
                      <Button
                        size={"md"}
                        onClick={() => {
                          setClearOperationSelected(op);
                          onOpen();
                        }}
                        alignSelf={"end"}
                        disabled={
                          isReclaiming && clearOperationSelected?.id === op.id
                        }
                        isLoading={
                          isReclaiming && clearOperationSelected?.id === op.id
                        }
                      >
                        Reclaimable
                      </Button>
                    )}
                  </VStack>
                );
              })}
            </VStack>
          </VStack>
        </VStack>
      </Center>
    </Stack>
  );
};
