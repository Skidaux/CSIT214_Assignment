import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Auth } from "./types";

// Complicated but necessary code stolen online
// rather than calling the same function over and over in every page
// wrap the username, id and log state into the dom to fetch easily in every page
async function getAuth(): Promise<Auth> {
  let auth: Auth = {
    loggedIn: false,
  };

  try {
    const id = await AsyncStorage.getItem("id");
    const username = await AsyncStorage.getItem("username");
    if (!id || !username) {
      return auth;
    }
    auth.id = Number(id);
    auth.username = username;
    auth.loggedIn = true;
  } catch (err) {
    console.log(err);
    return auth;
  }
  return auth;
}

type AuthContextValue = {
  auth: Auth;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  auth: { loggedIn: false },
  refresh: async () => {},
});

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<Auth>({ loggedIn: false });

  const refresh = async () => setAuth(await getAuth());

  useEffect(() => {
    refresh();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

export default { getAuth };
export { AuthProvider, useAuth };
