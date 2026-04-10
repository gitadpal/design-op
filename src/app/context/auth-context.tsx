import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  authMethod: "wallet" | "demo";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginDemo: () => void;
  privyLogin: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loginDemo: () => {},
  privyLogin: () => {},
  logout: () => {},
  isLoading: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("adpal_operation_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  let privyAuth;
  try {
    privyAuth = usePrivy();
  } catch {
    privyAuth = null;
  }

  const { login, logout: privyLogout, authenticated, user: privyUser, ready } = privyAuth || {
    login: () => {},
    logout: () => {},
    authenticated: false,
    user: null,
    ready: true,
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem("adpal_operation_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("adpal_operation_user");
    }
  }, [user]);

  useEffect(() => {
    if (privyAuth && ready && authenticated && privyUser?.wallet?.address) {
      const address = privyUser.wallet.address;
      setUser({
        id: privyUser.id,
        email: `${address.slice(0, 6)}...${address.slice(-4)}@wallet`,
        name: `Ops ${address.slice(0, 6)}...${address.slice(-4)}`,
        role: "Wallet Operator",
        authMethod: "wallet",
      });
    } else if (privyAuth && ready && !authenticated && user?.authMethod === "wallet") {
      setUser(null);
    }
  }, [authenticated, privyAuth, privyUser, ready, user?.authMethod]);

  const loginDemo = useCallback(() => {
    setUser({
      id: "demo-operator",
      email: "demo-ops@adpal.com",
      name: "Demo Operator",
      role: "Operations Lead",
      authMethod: "demo",
    });
  }, []);

  const logout = useCallback(() => {
    if (user?.authMethod === "wallet") {
      privyLogout();
    }
    setUser(null);
  }, [privyLogout, user?.authMethod]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginDemo,
        privyLogin: login,
        logout,
        isLoading: privyAuth ? !ready : false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
