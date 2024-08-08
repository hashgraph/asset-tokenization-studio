import {
  AccordionButton as ChakraAccordionButton,
  AccordionIcon as ChakraAccordionIcon,
  HStack,
  StackProps,
} from "@chakra-ui/react";
import { Button } from "@hashgraph/asset-tokenization-uicomponents/Interaction";
import { Tag } from "@hashgraph/asset-tokenization-uicomponents/DataDisplay";
import { useTranslation } from "react-i18next";
import { RouterManager } from "../../../router/RouterManager";
import { RouteName } from "../../../router/RouteName";
import { User } from "../../../utils/constants";
import { useAccountStore } from "../../../store/accountStore";
import { useWalletStore } from "../../../store/walletStore";

export interface AccordionItemCustomTitleProps extends StackProps {
  isAdmin: boolean;
  isExpanded: boolean;
  numOfTokens: number;
}

export const AccordionItemCustomTitle = (
  props: AccordionItemCustomTitleProps,
) => {
  const { isAdmin, isExpanded, numOfTokens, ...stackProps } = props;
  const { t } = useTranslation("globals");
  const { adminSecurities, holderSecurities } = useAccountStore();
  const { address } = useWalletStore();
  const userSecurities = isAdmin
    ? adminSecurities[address]
    : holderSecurities[address];

  return (
    <HStack
      data-testid="custom-title"
      w="full"
      h="64px"
      px={4}
      justify="space-between"
      bg={isAdmin ? "adminUI.100" : "holderUI.100"}
      borderRadius={isExpanded ? "4px 4px 0px 0px" : "4px"}
      {...stackProps}
    >
      <HStack>
        <ChakraAccordionButton gap={2} data-testid="custom-title-button">
          <h2 style={{ fontWeight: "bold" }}>
            {isAdmin ? t("admin") : t("holder")}
          </h2>
          <ChakraAccordionIcon />
        </ChakraAccordionButton>
        <HStack w="auto">
          <Tag label={t("quantityOfSecurities", { numOfTokens })} size="sm" />
        </HStack>
      </HStack>
      <HStack>
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            RouterManager.to(RouteName.DigitalSecuritiesList, {
              params: { type: isAdmin ? User.admin : User.holder },
            })
          }
          isDisabled={!userSecurities?.length}
        >
          {t("seeAll")}
        </Button>
      </HStack>
    </HStack>
  );
};
