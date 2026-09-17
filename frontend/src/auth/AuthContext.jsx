import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  loginUser,
} from "../api/auth";


const AuthContext =
  createContext(null);


export function AuthProvider({
  children,
}) {

  const [
    token,
    setToken,
  ] = useState(
    () =>
      localStorage.getItem(
        "fincompliance_token"
      )
  );


  const [
    user,
    setUser,
  ] = useState(
    () => {

      const raw =
        localStorage.getItem(
          "fincompliance_user"
        );


      if (!raw) {
        return null;
      }


      try {

        return JSON.parse(
          raw
        );

      } catch {

        return null;
      }
    }
  );


  async function login(
    username,
    password,
  ) {

    const result =
      await loginUser(
        username,
        password,
      );


    const userData = {
      username:
        result.username,

      role:
        result.role,
    };


    localStorage.setItem(
      "fincompliance_token",
      result.access_token,
    );


    localStorage.setItem(
      "fincompliance_user",
      JSON.stringify(
        userData
      ),
    );


    setToken(
      result.access_token
    );

    setUser(
      userData
    );


    return userData;
  }


  function logout() {

    localStorage.removeItem(
      "fincompliance_token"
    );

    localStorage.removeItem(
      "fincompliance_user"
    );

    setToken(null);
    setUser(null);
  }


  const value =
    useMemo(
      () => ({
        token,
        user,
        login,
        logout,
        isAuthenticated:
          Boolean(token),
      }),
      [
        token,
        user,
      ]
    );


  return (
    <AuthContext.Provider
      value={value}
    >

      {children}

    </AuthContext.Provider>
  );
}


export function useAuth() {

  const context =
    useContext(
      AuthContext
    );


  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }


  return context;
}
