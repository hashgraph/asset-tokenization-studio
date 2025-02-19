import { Box, HStack, Stack, useDisclosure } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/table-core";
import { Button, PhosphorIcon, PopUp, Table, Text } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { KYCModal } from "./KYCModal";
import { Trash } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { useGetKYCList } from "../../../../hooks/queries/useKYC";
import {
  KYCViewModel,
  GetKYCAccountsRequest,
  RevokeKYCRequest,
} from "@hashgraph/asset-tokenization-sdk";
import { useParams } from "react-router-dom";
import { useRevokeKYC } from "../../../../hooks/mutations/useKYC";
import { useRolesStore } from "../../../../store/rolesStore";
import { SecurityRole } from "../../../../utils/SecurityRole";

export const KYC = () => {
  const { id: securityId = "" } = useParams();

  const { roles: accountRoles } = useRolesStore();

  const { isOpen, onClose, onOpen } = useDisclosure();
  const {
    isOpen: isOpenRevokeModal,
    onClose: onCloseRevokeModal,
    onOpen: onOpenRevokeModal,
  } = useDisclosure();

  const { t: tList } = useTranslation("security", {
    keyPrefix: "details.kyc.list",
  });
  const { t: tTable } = useTranslation("security", {
    keyPrefix: "details.kyc.table",
  });
  const { t: tRevoke } = useTranslation("security", {
    keyPrefix: "details.kyc.revoke",
  });

  const [accountToRemove, setAccountToRemove] = useState<string>("");
  const [isRemoving, setIsRemoving] = useState(false);

  const { mutate: revokeKYC } = useRevokeKYC();
  const { data: KYCList, isLoading: isLoadingKYCList } = useGetKYCList(
    new GetKYCAccountsRequest({
      securityId,
      kycStatus: 1,
      start: 0,
      end: 100,
    }),
  );

  const columnsHelper = createColumnHelper<KYCViewModel>();

  const hasKYCRole = useMemo(
    () =>
      accountRoles.findIndex((rol) => rol === SecurityRole._KYC_ROLE) !== -1,
    [accountRoles],
  );

  const columns = [
    columnsHelper.accessor("issuer", {
      header: tTable("fields.accountId"),
      enableSorting: false,
    }),
    columnsHelper.accessor("validFrom", {
      header: tTable("fields.validFrom"),
      enableSorting: false,
      cell({ getValue }) {
        const date = Number(getValue());

        if (date > 1e13) {
          return "-";
        }

        const formatDate = new Date(date);

        return <Box>{formatDate.toLocaleString()}</Box>;
      },
    }),
    columnsHelper.accessor("validTo", {
      header: tTable("fields.validTo"),
      enableSorting: false,
      cell({ getValue }) {
        const date = Number(getValue());

        if (date > 1e13) {
          return "-";
        }

        const formatDate = new Date(Number(date));

        return <Box>{formatDate.toLocaleString()}</Box>;
      },
    }),
    columnsHelper.accessor("VCid", {
      header: tTable("fields.vcId"),
      enableSorting: false,
    }),
    ...(hasKYCRole
      ? [
          columnsHelper.display({
            id: "remove",
            header: tTable("fields.actions"),
            size: 5,
            enableSorting: false,
            cell(props) {
              const {
                row: {
                  original: { issuer },
                },
              } = props;

              return (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAccountToRemove(issuer);
                    onOpenRevokeModal();
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
      <Stack
        w="full"
        h="full"
        bg="neutral.50"
        borderRadius={1}
        p={4}
        pt={6}
        gap={4}
      >
        <HStack justifyContent={"space-between"}>
          <Text textStyle="ElementsSemiboldLG" color="neutral.light">
            {tList("title")}
          </Text>
          {hasKYCRole && (
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
        <Table
          name="kyc-list"
          columns={columns}
          data={KYCList ?? []}
          isLoading={isLoadingKYCList}
        />
      </Stack>
      <KYCModal isOpen={isOpen} onClose={onClose} />
      <PopUp
        id="revokeKYC"
        isOpen={isOpenRevokeModal}
        onClose={onCloseRevokeModal}
        icon={<PhosphorIcon as={Trash} size="md" />}
        title={tRevoke("title")}
        description={tRevoke("description")}
        confirmText={tRevoke("confirmText")}
        onConfirm={() => {
          setIsRemoving(true);

          const request = new RevokeKYCRequest({
            securityId,
            targetId: accountToRemove,
          });

          revokeKYC(request, {
            onSettled() {
              setIsRemoving(false);
            },
            onSuccess() {
              onCloseRevokeModal();
            },
          });
        }}
        onCancel={onCloseRevokeModal}
        cancelText={tRevoke("cancelText")}
        confirmButtonProps={{
          isLoading: isRemoving,
        }}
      />
    </>
  );
};
