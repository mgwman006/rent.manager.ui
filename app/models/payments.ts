
export interface PaymentTransactionCreateDTO{
  paymentBlockId: number,
  amount: number,
  currency:string,
  payerUserId:number,
  note:string,
  reference: string,
  method: PaymentMethod
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