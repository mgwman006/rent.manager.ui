import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { RentalProfileAction, RentalProfileState } from "../../models/rentalprofile";
import { rentalProfileReducer } from "./rentalProfileReducer";

type RentalProfileContextType = {
  rentalProfileState: RentalProfileState;
  dispatchRentalProfileState: React.Dispatch<RentalProfileAction>;
};

const RentalProfileContext = createContext<RentalProfileContextType | undefined>(undefined);

const loadInitialState = (): RentalProfileState => {
  try {
    const stored = localStorage.getItem("rentalProfileState");
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        rentalProfile: parsed.rentalProfile ?? null,
        loading: false,
        error: parsed.error ?? null,
      };
    }else{
      console.log("no stored user state")
    }
  } catch (error) {
    console.error("Failed to load rental profile state", error);
  }

  return {
    rentalProfile: null,
    loading: false,
    error: null,
  };
};

export const RentalProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(rentalProfileReducer, undefined, loadInitialState);

  useEffect(() => {
    try {
      if (state.rentalProfile !== null) {
        localStorage.setItem("rentalProfileState", JSON.stringify(state));
      } else {
        localStorage.removeItem("rentalProfileState");
      }
    } catch (error) {
      console.error("Failed to save rental profile state", error);
    }
  }, [state.rentalProfile, state.loading, state.error]);

  const value = useMemo(
    () => ({
      rentalProfileState: state,
      dispatchRentalProfileState: dispatch,
    }),
    [state, dispatch]
  );

  return (
    <RentalProfileContext.Provider value={value}>{children}</RentalProfileContext.Provider>
  );
};

export const useRentalProfile = () => {
  const context = useContext(RentalProfileContext);

  if (!context) {
    throw new Error("useRentalProfile must be used within RentalProfileProvider");
  }

  return context;
};
