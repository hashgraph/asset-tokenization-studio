// SPDX-License-Identifier: Apache-2.0

import { Box, HStack, Stack, useDisclosure } from "@chakra-ui/react";
import { Button, PhosphorIcon, PopUp, Table, Text, useToast } from "io-bricks-ui";
import { createColumnHelper } from "@tanstack/table-core";
import { Question, Trash, UserCirclePlus, UserCircleMinus, MagnifyingGlass } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useExternalControlStore } from "../../store/externalControlStore";
import { useUserStore } from "../../store/userStore";
import { useRolesStore } from "../../store/rolesStore";
import { User } from "../../utils/constants";
import { Header } from "./Components/Header";
import { AddAddressModal } from "./Components/AddAddressModal";
import { RemoveAddressModal } from "./Components/RemoveAddressModal";
import { CheckAddressModal } from "./Components/CheckAddressModal";

export type ExternalControl = {
  address: string;
  type: "whitelist" | "blacklist";
};

export const ExternalControlList = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpenAddModal, onClose: onCloseAddModal, onOpen: onOpenAddModal } = useDisclosure();
  const { isOpen: isOpenRemoveModal, onClose: onCloseRemoveModal, onOpen: onOpenRemoveModal } = useDisclosure();
  const { isOpen: isOpenCheckModal, onClose: onCloseCheckModal, onOpen: onOpenCheckModal } = useDisclosure();

  const { t: tTable } = useTranslation("externalControl", {
    keyPrefix: "list.table",
  });
  const { t: tModal } = useTranslation("externalControl", {
    keyPrefix: "list.modal",
  });
  const { t: tMessages } = useTranslation("externalControl", {
    keyPrefix: "list.messages",
  });

  const [externalControlSelected, setExternalControlSelected] = useState<ExternalControl | undefined>(undefined);

  const { externalControls, removeExternalControl } = useExternalControlStore();
  const { setType } = useUserStore();
  const { setRoles } = useRolesStore();

  useEffect(() => {
    setRoles([]);
    setType(User.general);
  }, [setRoles, setType]);

  const columnHelper = createColumnHelper<ExternalControl>();

  const columns = [
    columnHelper.accessor("address", {
      header: tTable("address"),
      enableSorting: false,
      size: 100,
    }),
    columnHelper.accessor("type", {
      header: tTable("state"),
      enableSorting: false,
      size: 600,
      cell({ getValue }) {
        const value = getValue();
        return (
          <Text _firstLetter={{ textTransform: "uppercase" }}>
            {value === "blacklist" ? tTable("blacklist") : tTable("whitelist")}
          </Text>
        );
      },
    }),
    columnHelper.display({
      header: tTable("actions"),
      enableSorting: false,
      cell(props) {
        const {
          row: { original },
        } = props;

        return (
          <HStack>
            <Button
              variant="table"
              size="xs"
              onClick={() => {
                setExternalControlSelected(original);
                onOpenAddModal();
              }}
            >
              <PhosphorIcon as={UserCirclePlus} sx={{ color: "secondary.500" }} />
            </Button>
            <Button
              variant="table"
              size="xs"
              onClick={() => {
                setExternalControlSelected(original);
                onOpenRemoveModal();
              }}
            >
              <PhosphorIcon as={UserCircleMinus} sx={{ color: "secondary.500" }} />
            </Button>
            <Button
              variant="table"
              size="xs"
              onClick={() => {
                setExternalControlSelected(original);
                onOpenCheckModal();
              }}
            >
              <PhosphorIcon as={MagnifyingGlass} sx={{ color: "secondary.500" }} />
            </Button>
            <Button variant="table" size="xs">
              <PhosphorIcon
                as={Trash}
                sx={{ color: "secondary.500" }}
                onClick={() => {
                  setExternalControlSelected(original);
                  onOpen();
                }}
              />
            </Button>
          </HStack>
        );
      },
    }),
  ];

  const handleDelete = () => {
    if (!externalControlSelected) return;

    try {
      removeExternalControl(externalControlSelected.address);

      toast.show({
        status: "success",
        title: tMessages("removeExternalControl.success"),
        description: tMessages("removeExternalControl.descriptionSuccess"),
      });
    } catch (error) {
      toast.show({
        status: "error",
        title: tMessages("removeExternalControl.error"),
        description: tMessages("removeExternalControl.descriptionFailed"),
      });
    }
  };

  return (
    <Stack gap={6}>
      <AddAddressModal
        isOpen={isOpenAddModal}
        onClose={onCloseAddModal}
        {...(externalControlSelected !== undefined && {
          externalControlSelected,
        })}
      />
      <RemoveAddressModal
        isOpen={isOpenRemoveModal}
        onClose={onCloseRemoveModal}
        {...(externalControlSelected !== undefined && {
          externalControlSelected,
        })}
      />
      <CheckAddressModal
        isOpen={isOpenCheckModal}
        onClose={onCloseCheckModal}
        {...(externalControlSelected !== undefined && {
          externalControlSelected,
        })}
      />
      <PopUp
        id="remove-external-control"
        isOpen={isOpen}
        onClose={onClose}
        icon={<PhosphorIcon as={Question} size="md" />}
        title={tModal("removeExternalControlPopUp.title")}
        description={tModal("removeExternalControlPopUp.description")}
        confirmText={tModal("removeExternalControlPopUp.confirmText")}
        onConfirm={() => {
          handleDelete();
          onClose();
        }}
        onCancel={onClose}
        cancelText={tModal("removeExternalControlPopUp.cancelText")}
      />

      <Header />
      <Box layerStyle={"container"}>
        <Table
          data={externalControls}
          columns={columns}
          name="externalControlList"
          emptyComponent={<Text>{tTable("empty")}</Text>}
        />
      </Box>
    </Stack>
  );
};
