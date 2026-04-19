import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);
const USER_STORAGE_KEY = "auth_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    const stallId = localStorage.getItem("stall_id");

    if (!token || !role) {
      return;
    }

    if (storedUser) {
      try {
        setUser({ token, ...JSON.parse(storedUser) });
        return;
      } catch (_error) {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }

    setUser({ token, role, stall_id: stallId || null });
  }, []);

  const value = useMemo(
    () => ({
      user,
      token: user?.token || null,
      role: user?.role || null,
      login: (token, authUser) => {
        const nextUser = {
          token,
          ...authUser,
          stall_id: authUser?.stall_id || null,
        };

        localStorage.setItem("token", token);
        localStorage.setItem("role", nextUser.role);
        localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify({
            id: nextUser.id || null,
            email: nextUser.email || "",
            role: nextUser.role,
            stall_id: nextUser.stall_id,
            name: nextUser.name || "",
          })
        );
        if (nextUser.stall_id) {
          localStorage.setItem("stall_id", nextUser.stall_id);
        } else {
          localStorage.removeItem("stall_id");
        }
        setUser(nextUser);
      },
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("stall_id");
        localStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
      }
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
