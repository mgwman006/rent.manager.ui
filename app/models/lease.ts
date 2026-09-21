import { TenantDetailsDTO, TenantInvitationDetailsDTO } from "./user";

// Mapped from backend Lease entity
export enum PaymentPeriod
{
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  SIX_MONTHS = "SIX_MONTHS",
  YEARLY = "YEARLY"
}

export enum RentFrequency
{
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY"
}

export enum LeaseStatus {
  ACTIVE = "ACTIVE",
  ENDED = "ENDED",
  TERMINATED = "TERMINATED",
  PENDING = "PENDING",
  EXPIRED = "EXPIRED",
  PENDING_LANDLORD_APPROVAL = "PENDING_LANDLORD_APPROVAL",
  PENDING_TENANT_APPROVAL = "PENDING_TENANT_APPROVAL"
}


 
export interface PaymentDTO {
  id: number;
  amount: number;
  date: string;
  method?: string;
}

export interface LeaseDetailsDTO {
  referenceNumber: string;
  id: number;
  startDate: string; // ISO date
  endDate: string; // ISO date
  rent: RentDTO,
  fullLeasePaymentRequired:boolean;
  status: LeaseStatus;
  tenant?: TenantDetailsDTO;
  tenantInvitations?: TenantInvitationDetailsDTO[];
}

export interface RentDTO{
    id :number,
    amount : number,
    currency : string,
    frequency: string
}

export interface LeaseCreateDTO {
  rentalProfileId: number;
  unitId: number;
  tenantId?: number;
  tenantFirstName?: string;
  tenantLastName?: string;
  tenantPhoneNumber?: string;
  startDate?: string;
  endDate?: string;
  rentAmount: number;
  currency: string;
  rentFrequency?: RentFrequency;
  fullLeasePaymentRequired: boolean;
}

export interface LeaseUpdateDTO {
  startDate?: string;
  endDate?: string;
  rentAmount: number;
  currency: string;
  rentFrequency?: RentFrequency;
  fullLeasePaymentRequired: boolean;
}

export interface RentSummaryDTO{
  totalExpectedAmount: number;
  totalPaidAmount: number;
  totalOutstandingAmount: number;
  status: RentPaymentStatus,
  paymentBlocks: PaymentBlockSummaryDTO[],
}

export interface PaymentBlockSummaryDTO{
  id:number;
  amount: number;
  paidAmount: number;
  outstandingAmount: number;
  startDate:string;
  endDate:string;
  dueDate: string;
  status: PaymentBlockStatus
}

export enum RentPaymentStatus
{
  PAID = "PAID",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  UNPAID = "UNPAID",
}

export enum PaymentBlockStatus
{
  PAID = "PAID",
  UNPAID = "UNPAID",
}

