import { Box, Center, useDisclosure, VStack } from "@chakra-ui/react";
import {
  Button,
  DefinitionList,
  PhosphorIcon,
  PopUp,
  useToast,
} from "io-bricks-ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useWalletStore } from "../../../../store/walletStore";
import {
  DATE_TIME_FORMAT,
  DEFAULT_PARTITION,
} from "../../../../utils/constants";
import { formatDate } from "../../../../utils/format";
import { Question } from "@phosphor-icons/react";
import { GET_HOLDS, useGetHolds } from "../../../../hooks/queries/useGetHolds";
import {
  GetHoldsIdForByPartitionRequest,
  HoldViewModel,
  ReclaimHoldByPartitionRequest,
} from "@hashgraph/asset-tokenization-sdk";
import { useReclaimHoldByPartition } from "../../../../hooks/mutations/useHold";
import { useQueryClient } from "@tanstack/react-query";
import { useSecurityStore } from "../../../../store/securityStore";

export type THoldMock = {
  originalAccount: string;
  destinationAccount?: string;
  escrowAccount: string;
  expirationDate: string;
  amount: string;
};

export const HoldList = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { t: tList } = useTranslation("security", {
    keyPrefix: "details.hold.list",
  });
  const { t: tActionsConfirm } = useTranslation("security", {
    keyPrefix: "details.hold.actions.confirmReclaimPopUp",
  });
  const { t: tMessages } = useTranslation("security", {
    keyPrefix: "details.hold.messages",
  });

  const { id: securityId = "" } = useParams();
  const { address } = useWalletStore();
  const { details } = useSecurityStore();

  const [holdSelected, setHoldSelected] = useState<HoldViewModel>();
  const [isReclaiming, setIsReclaiming] = useState(false);

  const {
    isOpen: isOpenReclaimConfirmationModal,
    onOpen: onOpenReclaimConfirmationModal,
    onClose: onCloseReclaimConfirmationModal,
  } = useDisclosure();

  const request = new GetHoldsIdForByPartitionRequest({
    securityId,
    targetId: address,
    partitionId: DEFAULT_PARTITION,
    start: 0,
    end: 50,
  });

  const { data, isLoading } = useGetHolds(request);
  const { mutate } = useReclaimHoldByPartition();

  const showEmpty = !isLoading && !data;

  return (
    <VStack gap={12} w="auto" pt={4}>
      {/* List */}
      <Center w={900}>
        <VStack gap={4} w={"full"}>
          {isLoading && <Box>Loading...</Box>}
          {showEmpty && <Box>{tList("noHolds")}</Box>}
          {!showEmpty &&
            data &&
            data.map((hold, index) => {
              const isExpirationDateResearch =
                Number(hold.expirationDate) < Date.now();

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
                        description: hold.id,
                      },
                      {
                        title: tList("originalAccount"),
                        description: hold.tokenHolderAddress,
                      },
                      ...(hold.destinationAddress
                        ? [
                            {
                              title: tList("destinationAccount"),
                              description: hold.destinationAddress,
                            },
                          ]
                        : []),
                      {
                        title: tList("escrowAccount"),
                        description: hold.escrowAddress,
                      },
                      {
                        title: tList("expirationDate"),
                        description: formatDate(
                          Number(hold.expirationDate),
                          DATE_TIME_FORMAT,
                        ),
                      },
                      {
                        title: tList("amount"),
                        description: hold.amount + " " + details?.symbol,
                      },
                    ]}
                  />
                  {isReclaimable && (
                    <Button
                      size={"md"}
                      onClick={() => {
                        setHoldSelected(hold);
                        onOpenReclaimConfirmationModal();
                      }}
                      alignSelf={"end"}
                      disabled={isReclaiming && holdSelected?.id === hold.id}
                      isLoading={isReclaiming && holdSelected?.id === hold.id}
                    >
                      Reclaimable
                    </Button>
                  )}
                </VStack>
              );
            })}
        </VStack>
      </Center>
      <PopUp
        id="reclaimConfirmationModal"
        isOpen={isOpenReclaimConfirmationModal}
        onClose={onCloseReclaimConfirmationModal}
        icon={<PhosphorIcon as={Question} size="md" />}
        title={tActionsConfirm("title")}
        description={tActionsConfirm("description")}
        confirmText={tActionsConfirm("confirmText")}
        onConfirm={() => {
          setIsReclaiming(true);

          const request = new ReclaimHoldByPartitionRequest({
            holdId: Number(holdSelected?.id),
            partitionId: DEFAULT_PARTITION,
            securityId,
            targetId: address,
          });

          mutate(request, {
            onSettled() {
              setIsReclaiming(false);
              setHoldSelected(undefined);
            },
            onSuccess(_data, variables) {
              const queryKey = [
                GET_HOLDS(variables.securityId, variables.targetId),
              ];

              queryClient.setQueryData(
                queryKey,
                (oldData: HoldViewModel[] | undefined) => {
                  if (!oldData) return [];
                  return oldData.filter((hold) => hold.id !== variables.holdId);
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
          onCloseReclaimConfirmationModal();
        }}
        onCancel={onCloseReclaimConfirmationModal}
        cancelText={tActionsConfirm("cancelText")}
      />
    </VStack>
  );
};
