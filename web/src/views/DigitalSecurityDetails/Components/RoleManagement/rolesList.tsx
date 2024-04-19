import { SecurityRole } from "../../../../utils/SecurityRole";

export const rolesList = [
  {
    label: "admin",
    value: SecurityRole._DEFAULT_ADMIN_ROLE,
  },
  {
    label: "minter",
    value: SecurityRole._ISSUER_ROLE,
  },
  {
    label: "controller",
    value: SecurityRole._CONTROLLER_ROLE,
  },
  {
    label: "pause",
    value: SecurityRole._PAUSER_ROLE,
  },
  {
    label: "controlList",
    value: SecurityRole._CONTROLLIST_ROLE,
  },
  {
    label: "corporateActions",
    value: SecurityRole._CORPORATEACTIONS_ROLE,
  },
  {
    label: "document",
    value: SecurityRole._DOCUMENTER_ROLE,
  },
  {
    label: "snapshot",
    value: SecurityRole._SNAPSHOT_ROLE,
  },
];
