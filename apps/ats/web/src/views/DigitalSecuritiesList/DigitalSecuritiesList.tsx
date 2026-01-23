// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from "react";
import {
  Table,
  PhosphorIcon,
  PopUp,
  Weight,
  Text,
  SearchInputController,
  Button,
  ClipboardButton,
  Link,
  Tooltip,
} from "io-bricks-ui";
import { CellContext, createColumnHelper } from "@tanstack/react-table";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Star, Trash } from "@phosphor-icons/react";
import { Header } from "../../components/Header";
import { useUserStore } from "../../store/userStore";
import { User } from "../../utils/constants";
import type { SecurityStore } from "../../store/securityStore";
import { useSecurityStore } from "../../store/securityStore";
import { HStack, Stack, useDisclosure } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useAccountStore } from "../../store/accountStore";
import { useWalletStore } from "../../store/walletStore";
import { RouterManager } from "../../router/RouterManager";
import { RouteName } from "../../router/RouteName";
import { useTable } from "../../hooks/useTable";
import { collapseText } from "../../utils/format";

type securitiesSearch = {
  search: string;
};

interface SecurityStoreWithRemove extends SecurityStore {
  remove?: unknown;
}

export const DigitalSecuritiesList = () => {
  const { setType } = useUserStore();
  const { securities, setDetails } = useSecurityStore();
  const columnsHelper = createColumnHelper<SecurityStoreWithRemove>();
  const { t: tHeader } = useTranslation("security", {
    keyPrefix: "list.header",
  });
  const { t: tTable } = useTranslation("security", {
    keyPrefix: "list.table",
  });
  const { t: tRemove } = useTranslation("security", {
    keyPrefix: "list.removeSecurityPopUp",
  });
  const { type } = useParams();
  const { adminSecurities, holderSecurities, removeSecurityFromHolder, toggleAdminFavorite, toggleHolderFavorite } =
    useAccountStore();
  const { address } = useWalletStore();
  const table = useTable();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [selectedSecurityAddressToRemove, setSelectedSecurityAddressToRemove] = useState("");

  const { control, watch } = useForm<securitiesSearch>({
    mode: "all",
    defaultValues: {
      search: "",
    },
  });
  const search = watch("search");

  useEffect(() => {
    setType(type as User);
    setDetails(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userSecurities = type === User.admin ? adminSecurities[address] : holderSecurities[address];

  useEffect(() => {
    if (userSecurities?.length === 0) {
      RouterManager.to(RouteName.Dashboard);
    }
  }, [userSecurities]);

  const securitiesToShow = useMemo(() => {
    const securitiesList: SecurityStore[] = [];

    userSecurities?.forEach((security) =>
      securities.find((digitalSecurity) => {
        if (security.address === digitalSecurity.address) {
          digitalSecurity.isFavorite = security.isFavorite;
          securitiesList.push(digitalSecurity);
        }
      }),
    );

    return securitiesList;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminSecurities, holderSecurities]);

  const digitalSecuritiesList = useMemo(() => {
    if (!search) return securitiesToShow;
    if (securitiesToShow.length === 0) return securitiesToShow;

    const searchFixed = search.toLowerCase();

    const list = (securitiesToShow as SecurityStore[]).filter(
      (security) =>
        security.name.toLowerCase().includes(searchFixed) ||
        security.symbol.toLowerCase().includes(searchFixed) ||
        security.type?.toLowerCase().includes(searchFixed) ||
        security.address.toLowerCase().includes(searchFixed) ||
        security.isin.toLowerCase().includes(searchFixed),
    );

    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, securitiesToShow]);

  const renderFavorite = (props: CellContext<SecurityStoreWithRemove, unknown>) => {
    const {
      row: {
        original: { address: securityAddress, isFavorite },
      },
    } = props;

    const handleOnClick = () =>
      type === User.admin
        ? toggleAdminFavorite(address, securityAddress)
        : toggleHolderFavorite(address, securityAddress);

    return (
      <Button
        variant="table"
        onClick={(e) => {
          e.stopPropagation();
          handleOnClick();
        }}
        size="xs"
      >
        <PhosphorIcon
          as={Star}
          {...(isFavorite && {
            color: "neutral.50",
            weight: Weight.Fill,
          })}
        />
      </Button>
    );
  };

  const renderRemove = (props: CellContext<SecurityStoreWithRemove, unknown | undefined>) => {
    const {
      row: {
        original: { address: securityAddress },
      },
    } = props;

    return (
      <Button
        variant="table"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedSecurityAddressToRemove(securityAddress);
          onOpen();
        }}
        size="xs"
      >
        <PhosphorIcon as={Trash} color="neutral.50" />
      </Button>
    );
  };

  const columns = [
    columnsHelper.display({
      id: "isFavorite",
      header: "",
      size: 21,
      enableSorting: false,
      cell: (props) => renderFavorite(props),
    }),
    columnsHelper.accessor("symbol", {
      header: tTable("fields.symbol"),
      size: 160,
      enableSorting: false,
      cell: ({ getValue }) => getValue(),
    }),
    columnsHelper.accessor("name", {
      header: tTable("fields.name"),
      size: 160,
      cell: ({ getValue }) => getValue(),
      enableSorting: false,
    }),
    columnsHelper.accessor("type", {
      header: tTable("fields.type"),
      size: 160,
      enableSorting: false,
      cell: ({ getValue }) => getValue(),
    }),
    columnsHelper.accessor("isin", {
      header: tTable("fields.isin"),
      size: 160,
      cell: ({ getValue }) => {
        const isin = getValue();
        return (
          <HStack gap={1.5}>
            <Text>{isin}</Text>
            <ClipboardButton sx={{ color: "secondary.500" }} value={isin} />
          </HStack>
        );
      },
      enableSorting: false,
    }),
    columnsHelper.accessor("address", {
      header: tTable("fields.address"),
      size: 160,
      enableSorting: false,
      cell: ({ getValue }) => {
        const address = getValue();

        return (
          <Button
            as={Link}
            target="_blank"
            href={`https://hashscan.io/testnet/contract/${address}`} //TODO move to env file
            variant="table"
            onClick={(e) => e.stopPropagation()}
          >
            {address}
          </Button>
        );
      },
    }),
    columnsHelper.accessor("evmAddress", {
      header: tTable("fields.evmAddress"),
      size: 160,
      enableSorting: false,
      cell: ({ getValue }) => {
        const evmAddress = getValue();

        if (!evmAddress) return <Text paddingLeft={4}>-</Text>;

        return (
          <Tooltip label={evmAddress}>
            <HStack gap={1.5}>
              <Button
                as={Link}
                target="_blank"
                href={`https://hashscan.io/testnet/contract/${evmAddress}`} //TODO move to env file
                variant="table"
                onClick={(e) => e.stopPropagation()}
              >
                {collapseText(evmAddress, 4, 8)}
              </Button>
              <ClipboardButton sx={{ color: "secondary.500" }} value={evmAddress} />
            </HStack>
          </Tooltip>
        );
      },
    }),
  ];

  if (type === User.holder) {
    const removeColumn = columnsHelper.display({
      id: "remove",
      header: "",
      size: 21,
      enableSorting: false,
      cell: (props) => renderRemove(props),
    });

    columns.push(removeColumn);
  }

  return (
    <>
      <Header page="security" label={tHeader("title")} />
      <Stack w="full" h="full" bg="neutral.50" borderRadius={1} p={4} pt={6} gap={4}>
        <Text textStyle="ElementsSemiboldLG" color="neutral.900">
          {tTable("title")}
        </Text>
        <Stack w="280px">
          <SearchInputController
            id="search"
            placeholder={tTable("searchPlaceholder")}
            onSearch={(search) => console.log("SEARCHING: ", search)}
            control={control}
            size="md"
            bg="white"
            borderColor="neutral.500"
          />
        </Stack>
        <Table
          name="digitalSecurities"
          columns={columns}
          data={digitalSecuritiesList}
          onClickRow={(row) => {
            RouterManager.to(RouteName.DigitalSecurityDetails, {
              params: { id: row.address },
            });
          }}
          totalElements={digitalSecuritiesList.length}
          totalPages={Math.ceil(digitalSecuritiesList.length / table.pagination.pageSize)}
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
          removeSecurityFromHolder(address, selectedSecurityAddressToRemove);
          onClose();
          setSelectedSecurityAddressToRemove("");
        }}
        onCancel={onClose}
        cancelText={tRemove("cancelText")}
      />
    </>
  );
};
