import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { api, LoginResponse, OAuthSignupPayload, SignupPayload, UserInfo } from "../api/client";

const AUTH_STORAGE_KEY = "hour.auth.tokens";

type AuthContextValue = {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  oauthSignup: (payload: OAuthSignupPayload) => Promise<void>;
  completeOAuthLogin: (tokens: LoginResponse) => void;
  logout: () => Promise<void>;
  refreshMe: () => Promise<boolean>;
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
  const [isLoading, setIsLoading] = useState(false);

  const clearAuth = useCallback(() => {
    storeTokens(null);
    setTokens(null);
    setUser(null);
  }, []);

  const loadUser = useCallback(
    async (nextTokens: LoginResponse | null) => {
      if (!nextTokens?.accessToken) {
        setUser(null);
        return false;
      }

      setIsLoading(true);
      try {
        const me = await api.me(nextTokens.accessToken);
        setUser(me);
        return true;
      } catch {
        clearAuth();
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [clearAuth]
  );

  const applyTokens = useCallback(
    async (nextTokens: LoginResponse) => {
      storeTokens(nextTokens);
      setTokens(nextTokens);
      const isValid = await loadUser(nextTokens);
      if (!isValid) {
        throw new Error("로그인 세션을 확인하지 못했습니다.");
      }
    },
    [loadUser]
  );

  const refreshMe = useCallback(async () => {
    if (!tokens?.accessToken) {
      setUser(null);
      return false;
    }
    return loadUser(tokens);
  }, [loadUser, tokens]);

  const completeOAuthLogin = useCallback(
    (nextTokens: LoginResponse) => {
      storeTokens(nextTokens);
      setTokens(nextTokens);
      void loadUser(nextTokens);
    },
    [loadUser]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken: tokens?.accessToken ?? null,
      refreshToken: tokens?.refreshToken ?? null,
      user,
      isAuthenticated: Boolean(tokens?.accessToken),
      isLoading,
      login: async (email, password) => {
        const nextTokens = await api.login(email, password);
        await applyTokens(nextTokens);
      },
      signup: async (payload) => {
        await api.signup(payload);
        const nextTokens = await api.login(payload.email, payload.password);
        await applyTokens(nextTokens);
      },
      oauthSignup: async (payload) => {
        const nextTokens = await api.oauthSignup(payload);
        await applyTokens(nextTokens);
      },
      completeOAuthLogin,
      logout: async () => {
        if (tokens?.refreshToken) {
          await api.logout(tokens.refreshToken).catch(() => undefined);
        }
        clearAuth();
      },
      refreshMe,
      updateMe: async (payload) => {
        if (!tokens?.accessToken) return;
        const nextUser = await api.updateMe(tokens.accessToken, payload);
        setUser(nextUser);
      }
    }),
    [applyTokens, clearAuth, completeOAuthLogin, refreshMe, tokens, user, isLoading]
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
