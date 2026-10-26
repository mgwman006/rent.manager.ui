import { RentalProfileAction, RentalProfileState } from "../../models/rentalprofile";

export const rentalProfileReducer = (
  state: RentalProfileState,
  action: RentalProfileAction
): RentalProfileState => {
  switch (action.type) {
    case "SET_RENTAL_PROFILE":
      return {
        ...state,
        rentalProfile: action.payload,
        loading: false,
        error: null,
      };

    case "CLEAR_RENTAL_PROFILE":
      return {
        ...state,
        rentalProfile: null,
        loading: false,
        error: null,
      };

    case "FETCH_START":
      return {
        ...state,
        loading: true,
        error: null,
      };

    case "FETCH_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};
