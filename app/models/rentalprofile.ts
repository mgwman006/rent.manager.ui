import { MembershipDetailsDTO } from "./user";


export interface RentalProfileDetailsDTO
{
  id: number;
  name: string;
  email: string;
  type: RentalProfileType;
  phoneNumber: string;
  userId: number;
  organizationId?: number;
  organizationName?: string;
  rentalUnits: RentalUnitDetailsDTO[];
}

export type RentalProfileState = {
  rentalProfile: RentalProfileDetailsDTO | null;
  loading: boolean;
  error: string | null;
};

export type RentalProfileAction =
  | { type: "SET_RENTAL_PROFILE"; payload: RentalProfileDetailsDTO | null }
  | { type: "CLEAR_RENTAL_PROFILE" }
  | { type: "FETCH_START" }
  | { type: "FETCH_ERROR"; payload: string };

export interface RentalUnitDetailsDTO
{
  id: number;
  name: string;
  address: string;
  unitType: string;
  rentalProfileId: number;
}


  export interface CreateRentalProfileDTO
  {
    phoneNumber:string;
    userId:number;
    name:string;
    email:string | null;
    type: RentalProfileType;
    organizationId?:number;
  }

  export enum RentalProfileType
  {
    Individual = "INDIVIDUAL",
    Business = "BUSINESS"
  }


export interface CreateRentReceivingAccountDTO
{
  paymentMethod:PaymentMethod;
  accountNumber?:string;
  bankName?:string;
  mobileMoneyProvider?:MobileMoneyProvider;
  mobileMoneyNumber?:string;
  isDefault:boolean;
}

export enum PaymentMethod
{
  CASH,
  BANK_TRANSFER,
  MOBILE_MONEY
}

export enum MobileMoneyProvider
{
  MIX_BY_YAS,
  MPESA,
  AIRTEL_MONEY,
  HALOPESA
}