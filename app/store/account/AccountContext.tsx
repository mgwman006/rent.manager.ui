import React, {createContext, useContext, useLayoutEffect, useMemo, useReducer} from "react";
import { AccountAction, AccountDetailsDto, AccountState } from "../../models/user";
import { ACCOUNT_STORAGE_KEY } from "../../utilities/constant";
import { accountReducer } from "./accountReducer";

type AccountContextType = {
  accountState: AccountState;
  dispatchAccountState: React.Dispatch<AccountAction>;
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

const loadInitialState = (): AccountState => {
  const defaultState: AccountState = {
    accountDetails: null,
    loading: false,
    error: null,
    outGoingUrl: null,
  };
  const callbackState = new URLSearchParams(window.location.search).get("state");

  if (callbackState !== null) {
    try {
      const parsed: unknown = JSON.parse(callbackState);
      if (typeof parsed !== "object" || parsed === null || !("accountDetails" in parsed)) {
        throw new Error("Missing account details");
      }
      const details = parsed.accountDetails;
      if (
        typeof details !== "object" || details === null
        || !("token" in details) || typeof details.token !== "string" || !details.token
        || !("userDetails" in details) || typeof details.userDetails !== "object" || details.userDetails === null
        || !("id" in details.userDetails) || typeof details.userDetails.id !== "number"
      ) {
        throw new Error("Missing token or user details");
      }

      return { ...defaultState, accountDetails: details as AccountDetailsDto };
    } catch (error) {
      console.error("Failed to load sign-in response", error);
      return { ...defaultState, error: "The sign-in response was invalid. Please sign in again." };
    }
  }

  try 
  {
    const stored = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (stored) 
    {
      const parsed = JSON.parse(stored);
      return {
        accountDetails: parsed.accountDetails ?? null,
        loading: false,
        error: parsed.error ?? null,
        outGoingUrl: parsed.outGoingUrl ?? null
      };
    }
  } 
  catch (error) 
  {
    console.error("Failed to load state", error);
  }

  return defaultState;
};

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(accountReducer, undefined,loadInitialState);

  useLayoutEffect(() => {
    try 
    {
      if(state.accountDetails)
      {
        localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(state));
      }
      else
      {
        localStorage.removeItem(ACCOUNT_STORAGE_KEY);
      }

      const url = new URL(window.location.href);
      if (url.searchParams.has("state")) {
        url.searchParams.delete("state");
        window.history.replaceState(window.history.state, "", url);
      }
    } 
    catch (e) 
    {
      console.error("Failed to save state", e);
    }
  }, [state.accountDetails, state.loading, state.error, state.outGoingUrl]);

  const value = useMemo(() => {
    return { accountState: state, dispatchAccountState: dispatch };
  }, [state, dispatch]);

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within StudentProvider");
  }
  return context;
};
