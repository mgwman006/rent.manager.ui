 export interface User {
    firstName : string;
    lastName : string;
    email : string;
    passWord: string;
};

export interface LogInDetails {
    email: string;
    passWord: string
}


export enum UserStatus {
    LogInSuccess = "LogInSuccess",
}

export interface LandLord
{
    firstName : string;
    lastName : string;
    phoneNumber : string;
    email : string;
    passWord: string;
}

export interface Tenant
{
    firstName : string;
    lastName : string;
    phoneNumber : string;
    email : string;
}

export interface LeaseInvitationDetailsDTO
{
  leaseId: number;
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  invitationToken: string;
  status: TenantInvitationStatus;
  expiresAt: string;
  acceptedAt: string;
  sentAt: string;
}

export interface LeaseInvitationCreateDTO
{
  leaseId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

export interface TenantDetailsDTO {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export enum TenantInvitationStatus
{
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  EXPIRED = "EXPIRED",
  REJECTED = "REJECTED",
  CANCELED = "CANCELED"
}

export interface TenantResponseDto
{
    id: number;
    firstName : string;
    lastName : string;
    phoneNumber : string;
    email : string;
}

export interface LandLordResponseDto
{
    id: number;
    firstName : string;
    lastName : string;
    phoneNumber : string;
    email : string;
}

export type AccountState = {
  accountDetails: AccountDetailsDto | null;
  loading: boolean;
  error: string | null;
  outGoingUrl: string | null;
};

export interface AccountDetailsDto {
  id: number;
  phoneNumber: string;
  email: string;
  enabled: boolean;
  userDetails: UserDetailsDTO,
  token: string
}

export interface UserDetailsDTO
{
  id:number,
  firstName:string,
  lastName:string,
  phoneNumber:string,
  tenantId:number,
  memberships: MembershipDetailsDTO[]
}

export interface MembershipDetailsDTO
{
  id:number;
  userId:number,
  organizationId:number,
  organizationName:string,
}

export type AccountAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: AccountDetailsDto }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "LOGOUT" }
  | { type: "APPEND_USER"; payload: string }
  | { type: "APPEND_JWT"; payload: string }
  | { type: "ADD_OUTGOING_URL"; outGoingUrl : string | null };

