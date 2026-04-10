import { Navigate, Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { AppSidebar } from "./app-sidebar";
import { useAuth } from "../context/auth-context";
import adpalLogo from "../../assets/36644de98caf356890fbfd747093ee89df1b9cef.png";

export function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <img src={adpalLogo} alt="AdPal" className="mx-auto mb-5 w-14 animate-pulse" />
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-[#177E73]/20 border-t-[#177E73] animate-spin" />
          <p className="text-sm text-muted-foreground">Authorizing console access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-full bg-background">
      <AppSidebar />
      <main className="panel-grid flex-1 overflow-auto">
        <Outlet />
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
