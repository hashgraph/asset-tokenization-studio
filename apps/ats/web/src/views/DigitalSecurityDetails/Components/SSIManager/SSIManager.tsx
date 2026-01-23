import { HStack, SkeletonText, Stack, useDisclosure, VStack } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/table-core";
import { Button, PhosphorIcon, PopUp, Table, Text } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { SSIManagerModal } from "./SSIManagerModal";
import { Trash } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { SSIManagerRevocationModal } from "./SSIManagerRevocationModal";
import { useGetIssuersList, useGetRevocationRegistryAddress } from "../../../../hooks/queries/useSSIManager";
import {
  GetIssuerListMembersRequest,
  GetRevocationRegistryAddressRequest,
  RemoveIssuerRequest,
} from "@hashgraph/asset-tokenization-sdk";
import { useParams } from "react-router-dom";
import { useRolesStore } from "../../../../store/rolesStore";
import { SecurityRole } from "../../../../utils/SecurityRole";
import { useRemoveIssuer } from "../../../../hooks/mutations/useSSIManager";

interface AllowedListFields {
  accountId: string;
}

export const SSIManager = () => {
  const { id: securityId = "" } = useParams();

  const { roles: accountRoles } = useRolesStore();

  const { isOpen, onClose, onOpen } = useDisclosure();
  const {
    isOpen: isOpenRevocationModal,
    onClose: onCloseRevocationModal,
    onOpen: onOpenRevocationModal,
  } = useDisclosure();
  const { isOpen: isOpenRemoveModal, onClose: onCloseRemoveModal, onOpen: onOpenRemoveModal } = useDisclosure();

  const { t: tRevocation } = useTranslation("security", {
    keyPrefix: "details.ssiManager.revocation",
  });
  const { t: tList } = useTranslation("security", {
    keyPrefix: "details.ssiManager.list",
  });
  const { t: tTable } = useTranslation("security", {
    keyPrefix: "details.ssiManager.table",
  });
  const { t: tRemove } = useTranslation("security", {
    keyPrefix: "details.ssiManager.removePopUp",
  });

  const [accountToRemove, setAccountToRemove] = useState<string>("");
  const [isRemoving, setIsRemoving] = useState(false);

  const columnsHelper = createColumnHelper<AllowedListFields>();

  const { mutate: removeIssuer } = useRemoveIssuer();
  const { data: issuersList, isLoading: isLoadingIssuersList } = useGetIssuersList(
    new GetIssuerListMembersRequest({
      securityId,
      start: 0,
      end: 100,
    }),
    {
      select(data) {
        return data.map((accountId) => ({
          accountId,
        }));
      },
    },
  );

  const { data: revocationRegistryAddress, isLoading: isLoadingRevocationRegistryAddress } =
    useGetRevocationRegistryAddress(
      new GetRevocationRegistryAddressRequest({
        securityId,
      }),
      {
        enabled: !!securityId,
        retry: false,
      },
    );

  const hasSSIManagerRole = useMemo(
    () => accountRoles.findIndex((rol) => rol === SecurityRole._SSI_MANAGER_ROLE) !== -1,
    [accountRoles],
  );

  const columns = [
    columnsHelper.accessor("accountId", {
      header: tTable("fields.accountId"),
      enableSorting: false,
    }),
    ...(hasSSIManagerRole
      ? [
          columnsHelper.display({
            id: "remove",
            header: tTable("fields.actions"),
            size: 5,
            enableSorting: false,
            cell(props) {
              const {
                row: {
                  original: { accountId },
                },
              } = props;

              return (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAccountToRemove(accountId);
                    onOpenRemoveModal();
                  }}
                  variant="table"
                  size="xs"
                >
                  <PhosphorIcon as={Trash} sx={{ color: "secondary.500" }} />
                </Button>
              );
            },
          }),
        ]
      : []),
  ];

  return (
    <>
      <Stack w="full" bg="neutral.50" borderRadius={1} p={4} pt={6} gap={4} mb={4}>
        <HStack justifyContent={"space-between"}>
          <VStack w={"full"} alignItems={"flex-start"}>
            <Text textStyle="ElementsSemiboldLG" color="neutral.light">
              {tRevocation("title")}
            </Text>
            {isLoadingRevocationRegistryAddress ? (
              <SkeletonText w={40} skeletonHeight={2} noOfLines={1} />
            ) : (
              <Text textStyle="ElementsRegularMD" color="neutral.light">
                {revocationRegistryAddress ?? "-"}
              </Text>
            )}
          </VStack>
          {hasSSIManagerRole && (
            <Button
              onClick={() => {
                onOpenRevocationModal();
              }}
              size="sm"
            >
              {tRevocation("change")}
            </Button>
          )}
        </HStack>
      </Stack>
      <Stack w="full" h="full" bg="neutral.50" borderRadius={1} p={4} pt={6} gap={4}>
        <HStack justifyContent={"space-between"}>
          <Text textStyle="ElementsSemiboldLG" color="neutral.light">
            {tList("title")}
          </Text>
          {hasSSIManagerRole && (
            <Button
              onClick={() => {
                onOpen();
              }}
              size="sm"
            >
              {tList("add")}
            </Button>
          )}
        </HStack>
        <Table name="ssi-manager-list" columns={columns} data={issuersList ?? []} isLoading={isLoadingIssuersList} />
      </Stack>
      <SSIManagerModal isOpen={isOpen} onClose={onClose} />
      <SSIManagerRevocationModal isOpen={isOpenRevocationModal} onClose={onCloseRevocationModal} />
      <PopUp
        id="removeIssuer"
        isOpen={isOpenRemoveModal}
        onClose={onCloseRemoveModal}
        icon={<PhosphorIcon as={Trash} size="md" />}
        title={tRemove("title")}
        description={tRemove("description")}
        confirmText={tRemove("confirmText")}
        onConfirm={() => {
          setIsRemoving(true);

          const request = new RemoveIssuerRequest({
            securityId,
            issuerId: accountToRemove,
          });

          removeIssuer(request, {
            onSettled() {
              setIsRemoving(false);
            },
            onSuccess() {
              onCloseRemoveModal();
            },
          });
        }}
        onCancel={onCloseRemoveModal}
        cancelText={tRemove("cancelText")}
        confirmButtonProps={{
          isLoading: isRemoving,
        }}
      />
    </>
  );
};
