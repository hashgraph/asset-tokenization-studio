import { Box, HStack, Stack, useDisclosure } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/table-core";
import { Button, PhosphorIcon, PopUp, Table, Text } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { KYCModal } from "./KYCModal";
import { Trash } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import {
  KycAccountDataViewModelResponse,
  useGetKYCList,
} from "../../../../hooks/queries/useKYC";
import {
  GetKYCAccountsDataRequest,
  RevokeKYCRequest,
} from "@hashgraph/asset-tokenization-sdk";
import { useParams } from "react-router-dom";
import { useRevokeKYC } from "../../../../hooks/mutations/useKYC";
import { useRolesStore } from "../../../../store/rolesStore";
import { SecurityRole } from "../../../../utils/SecurityRole";
import { DATE_TIME_FORMAT } from "../../../../utils/constants";
import { formatDate } from "../../../../utils/format";

const STATUS = {
  VALID: { status: "Valid", color: "green" },
  EXPIRED: { status: "Expired", color: "red" },
  PENDING: { status: "Pending", color: "orange" },
  UNTRUSTED: { status: "Untrusted", color: "red" },
  REVOKED: { status: "Revoked", color: "red" },
};

const getStatus = ({ kyc }: { kyc: KycAccountDataViewModelResponse }) => {
  const validToDate = formatDate(Number(kyc.validTo) * 1000, DATE_TIME_FORMAT);
  const validFromDate = formatDate(
    Number(kyc.validFrom) * 1000,
    DATE_TIME_FORMAT,
  );
  const currentDate = new Date().toLocaleString();

  if (!kyc.isIssuer) return STATUS.UNTRUSTED;
  if (currentDate < validFromDate) return STATUS.PENDING;
  if (currentDate >= validToDate) return STATUS.EXPIRED;
  if (
    Number(kyc.validTo) > 1e13 ||
    (currentDate >= validFromDate && currentDate < validToDate)
  )
    return STATUS.VALID;

  return STATUS.REVOKED;
};

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
    new GetKYCAccountsDataRequest({
      securityId,
      kycStatus: 1,
      start: 0,
      end: 100,
    }),
  );

  const columnsHelper = createColumnHelper<KycAccountDataViewModelResponse>();

  const hasKYCRole = useMemo(
    () =>
      accountRoles.findIndex((rol) => rol === SecurityRole._KYC_ROLE) !== -1,
    [accountRoles],
  );

  const columns = [
    columnsHelper.accessor("issuer", {
      header: tTable("fields.issuerId"),
      enableSorting: false,
    }),
    columnsHelper.accessor("account", {
      header: tTable("fields.accountId"),
      enableSorting: false,
    }),
    columnsHelper.accessor("validFrom", {
      header: tTable("fields.validFrom"),
      enableSorting: false,
      cell({ getValue }) {
        const formattedDate = formatDate(
          Number(getValue()) * 1000,
          DATE_TIME_FORMAT,
        );

        return <Box>{formattedDate}</Box>;
      },
    }),
    columnsHelper.accessor("validTo", {
      header: tTable("fields.validTo"),
      enableSorting: false,
      cell({ getValue }) {
        const formattedDate = formatDate(
          Number(getValue()) * 1000,
          DATE_TIME_FORMAT,
        );

        return <Box>{formattedDate}</Box>;
      },
    }),
    columnsHelper.accessor("VCid", {
      header: tTable("fields.vcId"),
      enableSorting: false,
    }),
    columnsHelper.accessor("status", {
      header: tTable("fields.status"),
      enableSorting: false,
      cell({ row }) {
        const { color, status } = getStatus({
          kyc: row.original,
        });

        return (
          <Box color={color}>
            <Text>{status}</Text>
          </Box>
        );
      },
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
