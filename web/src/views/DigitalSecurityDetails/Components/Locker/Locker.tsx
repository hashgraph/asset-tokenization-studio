import { Center, HStack, Stack, useDisclosure, VStack } from "@chakra-ui/react";
import {
  Button,
  DefinitionList,
  Heading,
  PhosphorIcon,
  PopUp,
  SearchInputController,
  Text,
} from "io-bricks-ui";
import { useForm } from "react-hook-form";
import { isValidHederaId, required } from "../../../../utils/rules";
import { useRolesStore } from "../../../../store/rolesStore";
import { SecurityRole } from "../../../../utils/SecurityRole";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RouterManager } from "../../../../router/RouterManager";
import { RouteName } from "../../../../router/RouteName";
import {
  GET_LOCKERS,
  useGetLockers,
} from "../../../../hooks/queries/useGetLockers";
import {
  GetLocksIdRequest,
  LockViewModel,
  ReleaseRequest,
} from "@hashgraph/asset-tokenization-sdk";
import { useState } from "react";
import { formatDate } from "../../../../utils/format";
import { DATE_TIME_FORMAT } from "../../../../utils/constants";
import { useRelease } from "../../../../hooks/mutations/useLocker";
import { useQueryClient } from "@tanstack/react-query";
import { WarningCircle } from "@phosphor-icons/react";

export const Locker = () => {
  const queryClient = useQueryClient();

  const { id = "" } = useParams();

  const { t } = useTranslation("security", {
    keyPrefix: "details.locker",
  });
  const { t: tButtons } = useTranslation("security", {
    keyPrefix: "details.locker.actions",
  });
  const { t: tRelease } = useTranslation("security", {
    keyPrefix: "details.locker.release",
  });

  const [targetId, setTargetId] = useState<string>("");
  const [lockToRelease, setLockToRelease] = useState<number>(0);
  const [isReleasing, setIsReleasing] = useState(false);

  const { control, formState, handleSubmit } = useForm<{ search: string }>({});

  const { roles } = useRolesStore();

  const { isOpen, onClose, onOpen } = useDisclosure();

  const {
    data: lockers,
    isInitialLoading: isInitLoading,
    isLoading,
    isFetching,
  } = useGetLockers(
    new GetLocksIdRequest({
      securityId: id,
      targetId,
      start: 0,
      end: 10,
    }),
    {
      cacheTime: 0,
      staleTime: 0,
      enabled: !!targetId,
      refetchOnWindowFocus: false,
      select: (data) => {
        return data.sort((a, b) => {
          return Number(a.expirationDate) - Number(b.expirationDate);
        });
      },
    },
  );

  const { mutate: releaseMutation } = useRelease();

  const hasLockerRole = roles.includes(SecurityRole._LOCKER_ROLE);

  const onSubmit = ({ search }: { search: string }) => {
    setTargetId(search);
  };

  const handleRelease = () => {
    setIsReleasing(true);

    const request = new ReleaseRequest({
      securityId: id,
      targetId,
      lockId: lockToRelease,
    });

    releaseMutation(request, {
      onSettled: async () => {
        setIsReleasing(false);
        onClose();
        setLockToRelease(0);
      },
      onSuccess: () => {
        queryClient.setQueryData(
          [GET_LOCKERS(id, targetId)],
          (oldData: LockViewModel[] | undefined) => {
            return oldData?.filter((lock) => lock.id !== lockToRelease);
          },
        );
        queryClient.invalidateQueries({
          queryKey: [GET_LOCKERS(id, targetId)],
        });
      },
    });
  };

  return (
    <VStack gap={4} h="full">
      <PopUp
        id="confirmReleasePopUp"
        isOpen={isOpen}
        onClose={onClose}
        icon={<PhosphorIcon as={WarningCircle} size="md" />}
        title={tRelease("confirmPopUp.title")}
        description={tRelease("confirmPopUp.description")}
        confirmText={tRelease("confirmPopUp.confirmText")}
        onConfirm={() => {
          onClose();
          handleRelease();
        }}
        onCancel={() => {
          onClose();
          setLockToRelease(0);
        }}
        cancelText={tRelease("confirmPopUp.cancelText")}
        confirmButtonProps={{ status: "danger" }}
      />
      <HStack w="full" justifyContent="flex-end" gap={4}>
        {hasLockerRole && (
          <Button
            data-testid="locker-button"
            as={RouterLink}
            to={RouterManager.getUrl(RouteName.DigitalSecurityLock, {
              params: { id },
            })}
            variant="secondary"
          >
            {tButtons("lock")}
          </Button>
        )}
      </HStack>
      <Stack w="full" h="full" layerStyle="container">
        <Center w="full" h="full" bg="neutral.dark.600">
          <VStack align="flex-start" p={6} gap={4}>
            <Heading textStyle="HeadingMediumLG">{t("search.title")}</Heading>
            <Text textStyle="BodyRegularMD">{t("search.description")}</Text>
            <HStack
              w="440px"
              gap={6}
              mt={3}
              as="form"
              onSubmit={handleSubmit(onSubmit)}
              alignItems="flex-start"
            >
              <SearchInputController
                id="search"
                placeholder={t("search.search")}
                control={control}
                onSearch={() => {}}
                size="sm"
                rules={{
                  required,
                  validate: { isValidHederaId: isValidHederaId },
                }}
              />
              <Button
                data-testid="search-button"
                size="sm"
                type="submit"
                isLoading={isInitLoading || isFetching}
                isDisabled={!formState.isValid || isInitLoading}
              >
                <Text textStyle="ElementsMediumSM" px={4}>
                  {t("search.search")}
                </Text>
              </Button>
            </HStack>
          </VStack>
        </Center>
      </Stack>
      <Stack w="full" h="full" gap={10}>
        {lockers && lockers.length && !isLoading && (
          <VStack align="flex-start" gap={4}>
            {lockers.map((lock, index) => {
              const canBeReleased =
                Number(lock.expirationDate) * 1000 < Date.now();

              return (
                <Center key={index} w="full" h="full" layerStyle="container">
                  <VStack w="440px" align="flex-end" py={4} gap={4}>
                    <DefinitionList
                      style={{ paddingBottom: 0 }}
                      items={[
                        { title: t("list.lockId"), description: lock.id },
                        { title: t("list.amount"), description: lock.amount },
                        {
                          title: t("list.expirationDate"),
                          description: formatDate(
                            Number(lock.expirationDate) * 1000,
                            DATE_TIME_FORMAT,
                          ),
                        },
                      ]}
                    />
                    {canBeReleased && hasLockerRole && (
                      <Button
                        size={"sm"}
                        disabled={isReleasing && lockToRelease === lock.id}
                        isLoading={isReleasing && lockToRelease === lock.id}
                        onClick={() => {
                          onOpen();
                          setLockToRelease(lock.id);
                        }}
                      >
                        {t("list.release")}
                      </Button>
                    )}
                  </VStack>
                </Center>
              );
            })}
          </VStack>
        )}
        {lockers && lockers.length === 0 && !isLoading && (
          <Center>
            <Text>{t("list.noLocks")}</Text>
          </Center>
        )}
      </Stack>
    </VStack>
  );
};
