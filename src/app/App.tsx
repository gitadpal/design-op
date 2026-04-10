import { RouterProvider } from "react-router-dom";
import { PrivyProvider } from "@privy-io/react-auth";
import { router } from "./routes";
import { AuthProvider } from "./context/auth-context";
import adpalLogo from "../assets/36644de98caf356890fbfd747093ee89df1b9cef.png";

const PRIVY_APP_ID = "cmmk1tmcn00v70cl77pedhvv8";
const isPrivyConfigured =
  PRIVY_APP_ID &&
  PRIVY_APP_ID !== "YOUR_PRIVY_APP_ID_HERE" &&
  (PRIVY_APP_ID.startsWith("cl") || PRIVY_APP_ID.startsWith("cm"));

export default function App() {
  if (isPrivyConfigured) {
    return (
      <PrivyProvider
        appId={PRIVY_APP_ID}
        config={{
          appearance: {
            theme: "light",
            accentColor: "#177E73",
            logo: adpalLogo,
          },
          loginMethods: ["wallet"],
          embeddedWallets: {
            createOnLogin: "off",
          },
        }}
      >
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </PrivyProvider>
    );
  }

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
