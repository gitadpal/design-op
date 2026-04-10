import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./components/app-layout";
import { LoginPage } from "./pages/login-page";
import { OverviewPage } from "./pages/overview-page";
import { DevicesPage } from "./pages/devices-page";
import { DeviceDetailPage } from "./pages/device-detail-page";
import { ClientsPage } from "./pages/clients-page";
import { CastStatusPage } from "./pages/cast-status-page";
import { CampaignsPage } from "./pages/campaigns-page";
import { CampaignDetailPage } from "./pages/campaign-detail-page";
import { RegisterDevicePage } from "./pages/register-device-page";

export const router = createBrowserRouter(
  [
    {
      path: "/login",
      Component: LoginPage,
    },
    {
      path: "/",
      Component: AppLayout,
      children: [
        { index: true, Component: OverviewPage },
        { path: "devices", Component: DevicesPage },
        { path: "devices/register", Component: RegisterDevicePage },
        { path: "devices/:id", Component: DeviceDetailPage },
        { path: "clients", Component: ClientsPage },
        { path: "casts", Component: CastStatusPage },
        { path: "campaigns", Component: CampaignsPage },
        { path: "campaigns/:id", Component: CampaignDetailPage },
      ],
    },
  ],
  { basename: "/design-op" }
);
