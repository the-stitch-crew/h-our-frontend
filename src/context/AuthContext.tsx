import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, LoginResponse, SignupPayload, UserInfo } from "../api/client";

const AUTH_STORAGE_KEY = "hour.auth.tokens";

type AuthContextValue = {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  updateMe: (payload: Partial<SignupPayload>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredTokens(): LoginResponse | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as LoginResponse) : null;
}

function storeTokens(tokens: LoginResponse | null) {
  if (tokens) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<LoginResponse | null>(() => readStoredTokens());
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(tokens?.accessToken));

  const refreshMe = async () => {
    if (!tokens?.accessToken) {
      setUser(null);
      return;
    }
    setIsLoading(true);
    try {
      const me = await api.me(tokens.accessToken);
      setUser(me);
    } catch {
      storeTokens(null);
      setTokens(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshMe();
  }, [tokens?.accessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken: tokens?.accessToken ?? null,
      refreshToken: tokens?.refreshToken ?? null,
      user,
      isAuthenticated: Boolean(tokens?.accessToken),
      isLoading,
      login: async (email, password) => {
        const nextTokens = await api.login(email, password);
        storeTokens(nextTokens);
        setTokens(nextTokens);
      },
      signup: async (payload) => {
        await api.signup(payload);
        const nextTokens = await api.login(payload.email, payload.password);
        storeTokens(nextTokens);
        setTokens(nextTokens);
      },
      logout: async () => {
        if (tokens?.refreshToken) {
          await api.logout(tokens.refreshToken).catch(() => undefined);
        }
        storeTokens(null);
        setTokens(null);
        setUser(null);
      },
      refreshMe,
      updateMe: async (payload) => {
        if (!tokens?.accessToken) return;
        const nextUser = await api.updateMe(tokens.accessToken, payload);
        setUser(nextUser);
      }
    }),
    [tokens, user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
