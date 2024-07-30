import { useMemo, useState } from "react";
import { AccordionPanel, SimpleGrid } from "@chakra-ui/react";
import {
  Accordion,
  AccordionItem,
  AccordionProps,
} from "@hashgraph/asset-tokenization-uicomponents/DataDisplay";
import { AccordionItemCustomTitle } from "./AccordionItemCustomTitle";
import { SecurityCard } from "./SecurityCard";
import { User } from "../../../utils/constants";
import { AddFavorite } from "./AddFavorite";
import { useAccountStore } from "../../../store/accountStore";
import { useWalletStore } from "../../../store/walletStore";
import { SecurityStore, useSecurityStore } from "../../../store/securityStore";

export interface FavoritesList
  extends Omit<AccordionProps, "children" | "title"> {
  type: User;
}

export const FavoritesList = (props: FavoritesList) => {
  const { type = User.admin } = props;
  const isAdmin = type === User.admin;
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const { adminSecurities, holderSecurities } = useAccountStore();
  const { address } = useWalletStore();
  const { securities } = useSecurityStore();
  const userSecurities =
    type === User.admin ? adminSecurities[address] : holderSecurities[address];

  const favoritesList = useMemo(() => {
    const favorites: SecurityStore[] = [];

    userSecurities?.forEach((security) =>
      securities.find((digitalSecurity) => {
        if (
          security.address === digitalSecurity.address &&
          security.isFavorite
        ) {
          digitalSecurity.isFavorite = true;
          favorites.push(digitalSecurity);
        }
      }),
    );

    return favorites;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, adminSecurities, holderSecurities]);

  return (
    <Accordion
      title=""
      allowToggle
      variant={type}
      onChange={(expanded) => setIsExpanded(expanded === 0)}
      defaultIndex={0}
      {...props}
    >
      <AccordionItem
        customTitle={
          <AccordionItemCustomTitle
            numOfTokens={userSecurities?.length ?? 0}
            isAdmin={isAdmin}
            isExpanded={isExpanded}
          />
        }
      >
        <AccordionPanel>
          <SimpleGrid spacingX={4} spacingY={5} columns={4}>
            {favoritesList?.map((security) => (
              <SecurityCard
                key={security.name}
                digitalSecurity={security}
                isAdmin={isAdmin}
              />
            ))}
            <AddFavorite isAdmin={isAdmin} />
          </SimpleGrid>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};
