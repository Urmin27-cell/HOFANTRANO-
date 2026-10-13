export type UserRole = 'TOMPO_TRANO' | 'MPANOFA';

export interface AdminSettings {
  id: string;
  adminName: string;
  pinCode: string;
  currency: string;
}

export interface PaymentAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  bankOrProvider: string;
}

export interface Property {
  id: string;
  code: string;
  name: string;
  address: string;
  zone: string;
  monthlyRent: number;
  status: 'MALALAKA' | 'MISY_MPANOFA';
  createdAt: string;
}

export interface Tenant {
  id: string;
  fullName: string;
  phone: string;
  startDate: string; // e.g. "2026-10-13"
  propertyId: string;
  monthlyRent: number;
  pinCode: string;
  createdAt: string;
}

export interface PaymentSubmission {
  id: string;
  tenantId: string;
  propertyId: string;
  amount: number;
  accountId: string;
  paymentDate: string;
  reference: string;
  rentMonth: string; // e.g. "Oktobra 2026" or "Cycle 1"
  proofImageUrl?: string;
  status: 'MIANDRY' | 'VOALOA';
  landlordSignature?: string;
  createdAt: string;
}

export interface Receipt {
  id: string;
  paymentId: string;
  receiptNumber: string;
  issueDate: string;
  tenantId: string;
  propertyId: string;
  amountPaid: number;
  amountInWords: string;
  rentMonth: string; // Specified rent month
  accountName: string;
  reference: string;
  landlordSignature: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string; // 'ADMIN' or tenantId
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING';
  read: boolean;
  createdAt: string;
}
