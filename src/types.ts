export type UserRole = 'TOMPO_TRANO' | 'MPANOFA' | 'ADMIN_PLATFORME';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

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
  ownerId: string;
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
  ownerId: string;
  fullName: string;
  phone: string;
  startDate: string;
  propertyId: string;
  monthlyRent: number;
  pinCode: string;
  createdAt: string;
  status: 'MIVANTAKA' | 'NIALA';
}

export interface Subscription {
  id: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  status: 'FREE_TRIAL' | 'ACTIVE' | 'EXPIRED';
}

export interface PaymentSubmission {
  id: string;
  ownerId: string;
  tenantId: string;
  propertyId: string;
  amount: number;
  accountId: string;
  paymentDate: string;
  reference: string;
  rentMonth: string;
  proofImageUrl?: string;
  status: 'MIANDRY' | 'VOALOA';
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
  rentMonth: string;
  accountName: string;
  reference: string;
  createdAt: string;
  landlordSignature?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING';
  read: boolean;
  createdAt: string;
}
