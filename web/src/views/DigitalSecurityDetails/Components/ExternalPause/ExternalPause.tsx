import { Checkbox, HStack, Stack, useDisclosure } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/table-core";
import { Button, PhosphorIcon, PopUp, Table, Text } from "io-bricks-ui";
import { useTranslation } from "react-i18next";
import { AddExternalPauseModal } from "./AddExternalPauseModal";
import { Trash } from "@phosphor-icons/react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetExternalPauses } from "../../../../hooks/queries/useExternalPause";

type ExternalPause = {
  id: string;
  state: "activated" | "deactivated";
};

const EXTERNAL_PAUSES_MOCK: ExternalPause[] = [
  {
    id: "1234",
    state: "activated",
  },
  {
    id: "1235",
    state: "deactivated",
  },
];

export const ExternalPause = () => {
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

  const { t: tList } = useTranslation("security", {
    keyPrefix: "details.externalPause.list",
  });
  const { t: tTable } = useTranslation("security", {
    keyPrefix: "details.externalPause.table",
  });
  const { t: tRemove } = useTranslation("security", {
    keyPrefix: "details.externalPause.remove",
  });

  const [externalPauseToRemove, setExternalPauseToRemove] =
    useState<string>("");
  const [isRemoving, setIsRemoving] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

  const handleCheckboxChange = (id: string) => {
    setSelectedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const newSelectedRows = EXTERNAL_PAUSES_MOCK.reduce(
      (acc, item) => ({ ...acc, [item.id]: isChecked }),
      {},
    );
    setSelectedRows(newSelectedRows);
  };

  const columnsHelper = createColumnHelper<ExternalPause>();

  const columns = [
    columnsHelper.display({
      id: "selection",
      header: () => {
        const totalRows = EXTERNAL_PAUSES_MOCK.length;
        const selectedCount =
          Object.values(selectedRows).filter(Boolean).length;

        return (
          <Checkbox
            isChecked={selectedCount === totalRows && totalRows > 0}
            isIndeterminate={selectedCount > 0 && selectedCount < totalRows}
            onChange={handleSelectAll}
          />
        );
      },
      enableSorting: false,
      size: 5,
      cell(props) {
        const {
          row: {
            original: { id },
          },
        } = props;
        return (
          <Checkbox
            isChecked={!!selectedRows[id]}
            onChange={() => handleCheckboxChange(id)}
          />
        );
      },
    }),
    columnsHelper.accessor("id", {
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
            original: { id },
          },
        } = props;

        return (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setExternalPauseToRemove(id);
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
          <HStack>
            <Button
              onClick={() => {
                onOpenRemoveModal();
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
        </HStack>
        <Table
          name="external-pause-list"
          columns={columns}
          data={EXTERNAL_PAUSES_MOCK ?? []}
          isLoading={false}
        />
      </Stack>
      <AddExternalPauseModal
        isOpen={isOpenAddModal}
        onClose={onCloseAddModal}
      />
      <PopUp
        id="removeExternalPause"
        isOpen={isOpenRemoveModal}
        onClose={onCloseRemoveModal}
        icon={<PhosphorIcon as={Trash} size="md" />}
        title={tRemove("title")}
        description={tRemove("description")}
        confirmText={tRemove("confirmText")}
        onConfirm={() => {
          setExternalPauseToRemove("");
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
