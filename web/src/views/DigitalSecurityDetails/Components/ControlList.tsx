import { Table } from "@hashgraph/assettokenization-uicomponents/DataDisplay";
import { CellContext, createColumnHelper } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { PopUp } from "@hashgraph/assettokenization-uicomponents";
import { Trash } from "@phosphor-icons/react";
import { HStack, Stack, useDisclosure } from "@chakra-ui/react";
import {
  PhosphorIcon,
  Text,
} from "@hashgraph/assettokenization-uicomponents/Foundations";
import { SearchInputController } from "@hashgraph/assettokenization-uicomponents/Forms/Controllers";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  Button,
  ClipboardButton,
} from "@hashgraph/assettokenization-uicomponents/Interaction";
import { useEffect, useMemo, useState } from "react";
import { useTable } from "../../../hooks/useTable";
import _chunk from "lodash/chunk";
import { isHederaValidAddress, required } from "../../../utils/rules";
import {
  useAddToControlList,
  useGetControlListCount,
  useGetControlListMembers,
  useRemoveFromControlList,
} from "../../../hooks/queries/useControlList";
import {
  ControlListRequest,
  GetControlListCountRequest,
  GetControlListMembersRequest,
} from "@hashgraph/assettokenization-sdk";
import { useParams } from "react-router-dom";
import { useToast } from "@hashgraph/assettokenization-uicomponents/Overlay/Toast";

type securitiesSearch = {
  search: string;
};

interface AllowedListFields {
  account: string;
}

export const ControlList = () => {
  const { id = "" } = useParams();
  const [accounts, setAccounts] = useState<AllowedListFields[]>([]);
  const [isRefetchAccountsLoading, setIsRefetchAccountsLoading] =
    useState<boolean>(true);
  const toast = useToast();

  const { data: controlListCount, refetch: refetchControlListCount } =
    useGetControlListCount(
      new GetControlListCountRequest({
        securityId: id,
      }),
      {
        onError: (error) => {
          console.log("SDK message --> Control list count error: ", error);
          toast.show({
            duration: 3000,
            title: t("messages.error"),
            status: "error",
          });
          setIsRefetchAccountsLoading(false);
        },
      },
    );

  const { data: controlListResponse = [] } = useGetControlListMembers(
    new GetControlListMembersRequest({
      securityId: id,
      start: 0,
      end: controlListCount ?? 0,
    }),
    {
      enabled: typeof controlListCount !== "undefined",
      onSettled: () => setIsRefetchAccountsLoading(false),
    },
  );

  useEffect(() => {
    if (controlListCount === 0) {
      setAccounts([]);
    }
  }, [controlListCount]);

  useEffect(() => {
    if (controlListResponse.length) {
      const accounts: AllowedListFields[] = controlListResponse.map(
        (account) => ({
          account,
        }),
      );

      setAccounts(accounts);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlListResponse]);

  const columnsHelper = createColumnHelper<AllowedListFields>();
  const { t: tTable } = useTranslation("security", {
    keyPrefix: "details.allowedList.table",
  });
  const { t } = useTranslation("security", {
    keyPrefix: "details.allowedList.search",
  });
  const { t: tRemove } = useTranslation("security", {
    keyPrefix: "details.allowedList.popUp",
  });

  const { isOpen, onClose, onOpen } = useDisclosure();
  const [accountToRemove, setAccountToRemove] = useState<string>("");
  const {
    pagination: { pageIndex, pageSize },
    ...table
  } = useTable();

  const refetchAccounts = (data: boolean | undefined) => {
    if (data) {
      setIsRefetchAccountsLoading(true);
      refetchControlListCount();
    }
  };

  // ADD TO CONTROL LIST
  const { mutate: addToControlList, isLoading: isLoadingAdd } =
    useAddToControlList({
      onSettled: (data) => refetchAccounts(data),
      onSuccess: () => {
        reset();
      },
    });

  const {
    control,
    handleSubmit,
    formState: { isValid },
    reset,
  } = useForm<securitiesSearch>({
    mode: "onSubmit",
  });

  const paginatedData = useMemo(
    () => _chunk(accounts, pageSize),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accounts, pageSize],
  );

  // REMOVE FROM CONTROL LIST
  const { mutate: removeFromControlList, isLoading: isLoadingRemove } =
    useRemoveFromControlList({
      onSettled: (data) => refetchAccounts(data),
    });

  const renderRemove = (
    props: CellContext<AllowedListFields, unknown | undefined>,
  ) => {
    const {
      row: {
        original: { account },
      },
    } = props;

    return (
      <Button
        variant="table"
        onClick={(e) => {
          e.stopPropagation();
          setAccountToRemove(account);
          onOpen();
        }}
        size="xs"
        isLoading={isLoadingRemove}
      >
        <PhosphorIcon as={Trash} sx={{ color: "secondary.500" }} />
      </Button>
    );
  };

  const columns = [
    columnsHelper.accessor("account", {
      header: tTable("account"),
      enableSorting: false,
      size: 995,
      cell: ({ getValue }) => {
        const account: string = getValue();

        return (
          <HStack gap={1.5}>
            <Text>{account}</Text>
            <ClipboardButton sx={{ color: "secondary.500" }} value={account} />
          </HStack>
        );
      },
    }),
    columnsHelper.display({
      id: "remove",
      header: tTable("action"),
      size: 5,
      enableSorting: false,
      cell: (props) => renderRemove(props),
    }),
  ];

  const removeSecurityFromAllowedList = (address: string) => {
    const requestToRemove = new ControlListRequest({
      securityId: id!,
      targetId: address ?? "",
    });
    console.log("request to remove from control list: ", requestToRemove);
    removeFromControlList(requestToRemove);
  };

  const onSubmit: SubmitHandler<securitiesSearch> = (params) => {
    const requestToAdd = new ControlListRequest({
      securityId: id!,
      targetId: params.search ?? "",
    });
    console.log("request to add to control list: ", requestToAdd);
    addToControlList(requestToAdd);
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
        <Text textStyle="ElementsSemiboldLG" color="neutral.light">
          {t("title")}
        </Text>
        <HStack
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          gap={4}
          alignItems="flex-start"
        >
          <Stack w="280px">
            <SearchInputController
              id="search"
              placeholder={t("placeholder")}
              onSearch={(search) => console.log("SEARCHING: ", search)}
              control={control}
              size="sm"
              rules={{
                required,
                validate: { isHederaValidAddress },
              }}
            />
          </Stack>
          <Button
            size="sm"
            isDisabled={!isValid}
            type="submit"
            isLoading={
              isLoadingAdd || isLoadingRemove || isRefetchAccountsLoading
            }
          >
            {t("button")}
          </Button>
        </HStack>
        <Table
          name="control-list"
          columns={columns}
          data={paginatedData[pageIndex]}
          pagination={{ pageIndex, pageSize }}
          totalElements={accounts.length}
          totalPages={Math.ceil(accounts.length / pageSize)}
          {...table}
        />
      </Stack>
      <PopUp
        id="removeSecurity"
        isOpen={isOpen}
        onClose={onClose}
        icon={<PhosphorIcon as={Trash} size="md" />}
        title={tRemove("title")}
        description={tRemove("description")}
        confirmText={tRemove("confirmText")}
        onConfirm={() => {
          removeSecurityFromAllowedList(accountToRemove);
          onClose();
        }}
        onCancel={onClose}
        cancelText={tRemove("cancelText")}
      />
    </>
  );
};
