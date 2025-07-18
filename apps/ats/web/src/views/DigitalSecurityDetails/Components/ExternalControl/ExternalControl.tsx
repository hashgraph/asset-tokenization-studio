import { Checkbox, HStack, Stack, useDisclosure } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/table-core";
import {
  Button,
  PhosphorIcon,
  PopUp,
  Table,
  Text,
  useToast,
} from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { Trash } from "@phosphor-icons/react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useRolesStore } from "../../../../store/rolesStore";
import { hasRole } from "../../../../utils/helpers";
import { SecurityRole } from "../../../../utils/SecurityRole";
import { AddExternalControlModal } from "./AddExternalControlModal";
import {
  useRemoveExternalControlList,
  useUpdateExternalControlLists,
} from "../../../../hooks/mutations/useExternalControl";
import { useGetExternalControls } from "../../../../hooks/queries/useExternalControl";
import {
  RemoveExternalControlListRequest,
  UpdateExternalControlListsRequest,
} from "@hashgraph/asset-tokenization-sdk";

type ExternalControl = {
  address: string;
};

export const ExternalControl = () => {
  const toast = useToast();
  const { id: securityId = "" } = useParams();

  const {
    isOpen: isOpenAddModal,
    onClose: onCloseAddModal,
    onOpen: onOpenAddModal,
  } = useDisclosure();
  const {
    isOpen: isOpenRemoveModal,
    onClose: onCloseRemoveModal,
    onOpen: onOpenRemoveModal,
  } = useDisclosure();
  const {
    isOpen: isOpenRemoveMultipleModal,
    onClose: onCloseRemoveMultipleModal,
    onOpen: onOpenRemoveMultipleModal,
  } = useDisclosure();

  const { roles } = useRolesStore();

  const hasControlManagerRole = hasRole(
    roles,
    SecurityRole._CONTROL_LIST_MANAGER_ROLE,
  );

  const { t: tList } = useTranslation("security", {
    keyPrefix: "details.externalControl.list",
  });
  const { t: tTable } = useTranslation("security", {
    keyPrefix: "details.externalControl.table",
  });
  const { t: tRemove } = useTranslation("security", {
    keyPrefix: "details.externalControl.remove",
  });
  const { t: tMessage } = useTranslation("externalControl", {
    keyPrefix: "list.messages",
  });

  const [externalControlToRemove, setExternalControlToRemove] =
    useState<string>("");
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

  const { data: externalControls, isLoading } =
    useGetExternalControls(securityId);
  const { mutateAsync, isLoading: isLoadingRemove } =
    useRemoveExternalControlList();
  const {
    mutateAsync: updateExternalControls,
    isLoading: isLoadingUpdateExternalControls,
  } = useUpdateExternalControlLists();

  const handleCheckboxChange = (id: string) => {
    setSelectedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const newSelectedRows = externalControls.reduce(
      (acc, item) => ({ ...acc, [item.address]: isChecked }),
      {},
    );
    setSelectedRows(newSelectedRows);
  };

  const columnsHelper = createColumnHelper<ExternalControl>();

  const columns = [
    ...(hasControlManagerRole
      ? [
          columnsHelper.display({
            id: "selection",
            header: () => {
              const totalRows = externalControls.length;
              const selectedCount =
                Object.values(selectedRows).filter(Boolean).length;

              return (
                <Checkbox
                  isChecked={selectedCount === totalRows && totalRows > 0}
                  isIndeterminate={
                    selectedCount > 0 && selectedCount < totalRows
                  }
                  onChange={handleSelectAll}
                />
              );
            },
            enableSorting: false,
            size: 5,
            cell(props) {
              const {
                row: {
                  original: { address },
                },
              } = props;
              return (
                <Checkbox
                  isChecked={!!selectedRows[address]}
                  onChange={() => handleCheckboxChange(address)}
                />
              );
            },
          }),
        ]
      : []),
    columnsHelper.accessor("address", {
      header: tTable("fields.id"),
      enableSorting: false,
    }),
    columnsHelper.display({
      id: "remove",
      header: tTable("fields.actions"),
      size: 5,
      enableSorting: false,
      cell(props) {
        const {
          row: {
            original: { address },
          },
        } = props;

        if (!hasControlManagerRole) return;

        return (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setExternalControlToRemove(address);
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
  ];

  const disabledRemoveItems =
    Object.values(selectedRows).filter(Boolean).length <= 0;

  const handleMultipleRemove = () => {
    const controlledToDelete = Object.entries(selectedRows)
      .filter(([_, value]) => value)
      .map(([key]) => key);
    if (controlledToDelete.length > 0) {
      updateExternalControls(
        new UpdateExternalControlListsRequest({
          securityId,
          externalControlListsAddresses: controlledToDelete,
          actives: controlledToDelete.map(() => false),
        }),
      ).finally(() => {
        onCloseRemoveMultipleModal();
        toast.show({
          duration: 3000,
          title: tMessage("removeExternalControl.success"),
          description: tMessage("removeExternalControl.descriptionSuccess"),
          variant: "subtle",
          status: "success",
        });
      });
    }
  };

  const handleRemove = () => {
    mutateAsync(
      new RemoveExternalControlListRequest({
        securityId,
        externalControlListAddress: externalControlToRemove,
      }),
    ).finally(() => {
      setExternalControlToRemove("");
      onCloseRemoveModal();
    });
  };

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
          {hasControlManagerRole && (
            <HStack>
              <Button
                onClick={() => {
                  onOpenRemoveMultipleModal();
                }}
                size="sm"
                variant={"secondary"}
                isDisabled={disabledRemoveItems}
              >
                {tList("removeItemsSelected")}
              </Button>
              <Button
                onClick={() => {
                  onOpenAddModal();
                }}
                size="sm"
              >
                {tList("add")}
              </Button>
            </HStack>
          )}
        </HStack>

        <Table
          name="external-pause-list"
          columns={columns}
          data={externalControls ?? []}
          isLoading={isLoading}
          emptyComponent={<Text>{tTable("empty")}</Text>}
        />
      </Stack>
      <AddExternalControlModal
        isOpen={isOpenAddModal}
        onClose={onCloseAddModal}
      />
      <PopUp
        id="removeExternalControl"
        isOpen={isOpenRemoveModal}
        onClose={() => {
          //   setExternalPauseToRemove("");
          onCloseRemoveModal();
        }}
        icon={<PhosphorIcon as={Trash} size="md" />}
        title={tRemove("title")}
        description={tRemove("description")}
        confirmText={tRemove("confirmText")}
        onConfirm={() => {
          handleRemove();
        }}
        onCancel={() => {
          setExternalControlToRemove("");
          onCloseRemoveModal();
        }}
        cancelText={tRemove("cancelText")}
        confirmButtonProps={{
          isLoading: isLoadingRemove,
        }}
      />
      <PopUp
        id="removeExternalMultipleControl"
        isOpen={isOpenRemoveMultipleModal}
        onClose={onCloseRemoveMultipleModal}
        icon={<PhosphorIcon as={Trash} size="md" />}
        title={tRemove("title")}
        description={tRemove("description")}
        confirmText={tRemove("confirmText")}
        onConfirm={() => {
          handleMultipleRemove();
        }}
        onCancel={onCloseRemoveMultipleModal}
        cancelText={tRemove("cancelText")}
        confirmButtonProps={{
          isLoading: isLoadingUpdateExternalControls,
        }}
      />
    </>
  );
};
