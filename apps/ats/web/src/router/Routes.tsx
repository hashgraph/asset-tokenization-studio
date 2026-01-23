// SPDX-License-Identifier: Apache-2.0

import i18n from "i18next";
import { MainLayout } from "../layouts/MainLayout";
import { GenericRoute } from "./components/GenericRoute";
import { PrivateRoute } from "./components/PrivateRoute";
import { RouteName } from "./RouteName";
import { RoutePath } from "./RoutePath";
import { Landing } from "../views/Landing/Landing";
import { AddSecurity } from "../views/AddSecurity/AddSecurity";
import { CreateSecurity } from "../views/Dashboard/Components/CreateSecurity";
import { CreateEquity } from "../views/CreateEquity/CreateEquity";
import { CreateBond } from "../views/CreateBond/CreateBond";
import { Dashboard } from "../views/Dashboard/Dashboard";
import { DigitalSecuritiesList } from "../views/DigitalSecuritiesList/DigitalSecuritiesList";
import { DigitalSecurityDetails } from "../views/DigitalSecurityDetails/DigitalSecurityDetails";
import { DigitalSecurityMint } from "../views/DigitalSecurityMint/DigitalSecurityMint";
import { DigitalSecurityTransfer } from "../views/DigitalSecurityTransfer/DigitalSecurityTransfer";
import { DigitalSecurityRedeem } from "../views/DigitalSecurityRedeem/DigitalSecurityRedeem";
import { DigitalSecurityForceTransfer } from "../views/DigitalSecurityForceTransfer/DigitalSecurityForceTransfer";
import { DigitalSecurityForceRedeem } from "../views/DigitalSecurityForceRedeem/DigitalSecurityForceRedeem";
import { DigitalSecurityLocker } from "../views/DigitalSecurityLocker/DigitalSecurityLocker";
import { ExternalPauseList } from "../views/ExternalPauseList/ExternalPauseList";
import { CreateExternalPause } from "../views/CreateExternalPause/CreateExternalPause";
import { AddExternalPause } from "../views/AddExternalPause/AddExternalPause";
import { ExternalControlList } from "../views/ExternalControlList/ExternalControlList";
import { CreateExternalControl } from "../views/CreateExternalControl/CreateExternalControl";
import { AddExternalControl } from "../views/AddExternalControl/AddExternalControl";
import { ExternalControlDetails } from "../views/ExternalControlDetails/ExternalControlDetails";
import { ExternalKYCList } from "../views/ExternalKYCList/ExternalKYCList";
import { AddExternalKYC } from "../views/AddExternalKYC/AddExternalKYC";
import { DigitalSecurityFreeze } from "../views/DigitalSecurityFreeze/DigitalSecurityFreeze";

const t = (key: RouteName) => i18n.t(`routes:${key}`);

export const routes = [
  {
    element: <MainLayout />,
    children: [
      {
        path: RoutePath.LANDING,
        breadcrumb: t(RouteName.Landing),
        element: <Landing />,
      },
      {
        path: RoutePath.DASHBOARD,
        breadcrumb: t(RouteName.Dashboard),
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePath.EXTERNAL_PAUSE_LIST,
        breadcrumb: t(RouteName.ExternalPauseList),
        element: (
          <PrivateRoute>
            <ExternalPauseList />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePath.CREATE_EXTERNAL_PAUSE,
        breadcrumb: t(RouteName.CreateExternalPause),
        element: (
          <PrivateRoute>
            <CreateExternalPause />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePath.ADD_EXTERNAL_PAUSE,
        breadcrumb: t(RouteName.AddExternalPause),
        element: (
          <PrivateRoute>
            <AddExternalPause />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePath.EXTERNAL_CONTROL_LIST,
        breadcrumb: t(RouteName.ExternalControlList),
        element: (
          <PrivateRoute>
            <ExternalControlList />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePath.EXTERNAL_CONTROL_DETAILS,
        breadcrumb: t(RouteName.ExternalControlDetails),
        element: (
          <PrivateRoute>
            <ExternalControlDetails />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePath.CREATE_EXTERNAL_CONTROL,
        breadcrumb: t(RouteName.CreateExternalControl),
        element: (
          <PrivateRoute>
            <CreateExternalControl />
          </PrivateRoute>
        ),
      },

      {
        path: RoutePath.ADD_EXTERNAL_CONTROL,
        breadcrumb: t(RouteName.AddExternalControl),
        element: (
          <PrivateRoute>
            <AddExternalControl />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePath.EXTERNAL_KYC_LIST,
        breadcrumb: t(RouteName.ExternalKYCList),
        element: (
          <PrivateRoute>
            <ExternalKYCList />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePath.ADD_EXTERNAL_KYC,
        breadcrumb: t(RouteName.AddExternalKYC),
        element: (
          <PrivateRoute>
            <AddExternalKYC />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePath.DIGITAL_SECURITIES_LIST,
        breadcrumb: t(RouteName.DigitalSecuritiesList),
        element: (
          <PrivateRoute>
            <DigitalSecuritiesList />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePath.ADD_SECURITY,
        breadcrumb: t(RouteName.AddSecurity),
        element: (
          <PrivateRoute>
            <AddSecurity />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePath.CREATE_SECURITY,
        breadcrumb: t(RouteName.CreateSecurity),
        element: (
          <PrivateRoute>
            <CreateSecurity />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePath.CREATE_EQUITY,
        breadcrumb: t(RouteName.CreateEquity),
        element: (
          <PrivateRoute>
            <CreateEquity />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePath.CREATE_BOND,
        breadcrumb: t(RouteName.CreateBond),
        element: (
          <PrivateRoute>
            <CreateBond />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePath.DIGITAL_SECURITY_DETAILS,
        breadcrumb: t(RouteName.DigitalSecurityDetails),
        element: (
          <PrivateRoute>
            <DigitalSecurityDetails />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePath.DIGITAL_SECURITY_MINT,
        breadcrumb: t(RouteName.DigitalSecurityMint),
        element: (
          <PrivateRoute>
            <DigitalSecurityMint />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePath.DIGITAL_SECURITY_FREEZE,
        breadcrumb: t(RouteName.DigitalSecurityFreeze),
        element: (
          <PrivateRoute>
            <DigitalSecurityFreeze />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePath.DIGITAL_SECURITY_TRANSFER,
        breadcrumb: t(RouteName.DigitalSecurityTransfer),
        element: (
          <PrivateRoute>
            <DigitalSecurityTransfer />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePath.DIGITAL_SECURITY_FORCE_TRANSFER,
        breadcrumb: t(RouteName.DigitalSecurityForceTransfer),
        element: (
          <PrivateRoute>
            <DigitalSecurityForceTransfer />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePath.DIGITAL_SECURITY_REDEEM,
        breadcrumb: t(RouteName.DigitalSecurityRedeem),
        element: (
          <PrivateRoute>
            <DigitalSecurityRedeem />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePath.DIGITAL_SECURITY_FORCE_REDEEM,
        breadcrumb: t(RouteName.DigitalSecurityForceRedeem),
        element: (
          <PrivateRoute>
            <DigitalSecurityForceRedeem />
          </PrivateRoute>
        ),
      },
      {
        path: RoutePath.DIGITAL_SECURITY_LOCK,
        breadcrumb: t(RouteName.DigitalSecurityLock),
        element: (
          <PrivateRoute>
            <DigitalSecurityLocker />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: (
      <PrivateRoute>
        <GenericRoute />
      </PrivateRoute>
    ),
  },
];
